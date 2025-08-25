package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.RefreshToken;
import com.solsol.heycalendar.domain.Role;
import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.dto.request.*;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.mapper.RefreshTokenMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import com.solsol.heycalendar.security.AuthTokenService;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AuthService 단위 테스트 (builder/getter만 사용)
 */
@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AuthServiceTest {

	@Mock AuthenticationManager authenticationManager;
	@Mock JwtUtil jwtUtil; // 파싱/검증용
	@Mock AuthTokenService authTokenService; // ✅ 토큰 생성 책임
	@Mock UserMapper userMapper;
	@Mock RefreshTokenMapper refreshTokenMapper;
	@Mock PasswordEncoder passwordEncoder;

	@InjectMocks AuthService authService;

	@BeforeEach
	void setupRequestContext() {
		MockHttpServletRequest request = new MockHttpServletRequest();
		request.addHeader("User-Agent", "JUnit");
		request.setRemoteAddr("127.0.0.1");
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
	}

	// ====== login() ======
	@Test
	@DisplayName("로그인 성공 시 액세스/리프레시 토큰 발급 및 RefreshToken 저장")
	void login_success() {
		AuthRequest req = AuthRequest.builder()
			.userId("alice")
			.password("password1!")
			.build();

		CustomUserPrincipal principal = mock(CustomUserPrincipal.class);
		when(principal.getUserNm()).thenReturn("20250001");
		when(principal.getUserId()).thenReturn("alice");
		when(principal.getRole()).thenReturn("STUDENT");
		when(principal.getUsername()).thenReturn("홍길동");
		when(principal.getDeptNm()).thenReturn(3001L);
		when(principal.getCollegeNm()).thenReturn(2001L);
		when(principal.getUnivNm()).thenReturn(1001L);
		when(principal.getGrade()).thenReturn(2);

		Authentication auth = mock(Authentication.class);
		when(auth.getPrincipal()).thenReturn(principal);
		when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);

		// ✅ 토큰 생성은 AuthTokenService로 스텁
		when(authTokenService.createAccessToken(
			eq("20250001"),
			eq("alice"),
			eq("STUDENT"),
			eq("홍길동"),
			eq(3001L),
			eq(2001L),
			eq(1001L),
			eq(2)
		)).thenReturn("ACCESS_TOKEN_EXAMPLE");

		when(authTokenService.createRefreshToken(eq("20250001"), anyString()))
			.thenReturn("REFRESH_TOKEN_EXAMPLE");

		// 🔐 refresh 토큰 파싱은 여전히 JwtUtil에서 수행
		@SuppressWarnings("unchecked")
		Jws<Claims> jws = (Jws<Claims>) mock(Jws.class);
		Claims claims = mock(Claims.class);
		when(claims.getIssuedAt()).thenReturn(new Date());
		when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 3_600_000));
		when(jws.getPayload()).thenReturn(claims);
		when(jwtUtil.parse("REFRESH_TOKEN_EXAMPLE")).thenReturn(jws);

		AuthResponse res = authService.login(req);

		assertThat(res.getAccessToken()).isEqualTo("ACCESS_TOKEN_EXAMPLE");
		assertThat(res.getRefreshToken()).isEqualTo("REFRESH_TOKEN_EXAMPLE");
		verify(refreshTokenMapper, times(1)).insert(any(RefreshToken.class));
		verifyNoMoreInteractions(refreshTokenMapper);
	}

	// ====== refresh() ======
	@Test
	@DisplayName("refresh 성공: 기존 refresh 검증 → revoke → 신규 access/refresh 발급 및 저장 (확장 클레임 포함)")
	void refresh_success() {
		String oldJti = UUID.randomUUID().toString();
		String oldRefresh = "OLD_REFRESH_TOKEN";

		RefreshRequest req = RefreshRequest.builder()
			.refreshToken(oldRefresh)
			.build();

		when(jwtUtil.validateToken(oldRefresh)).thenReturn(true);
		when(jwtUtil.isRefresh(oldRefresh)).thenReturn(true);

		@SuppressWarnings("unchecked")
		Jws<Claims> oldJws = (Jws<Claims>) mock(Jws.class);
		Claims oldClaims = mock(Claims.class);
		when(oldClaims.getId()).thenReturn(oldJti);
		when(oldJws.getPayload()).thenReturn(oldClaims);
		when(jwtUtil.parse(oldRefresh)).thenReturn(oldJws);

		RefreshToken active = RefreshToken.builder()
			.userId("alice")
			.userNm("20250001")
			.token(oldJti)
			.revoked(false)
			.build();
		when(refreshTokenMapper.findActiveByToken(oldJti)).thenReturn(active);

		// User 엔티티는 목으로 처리 (getter만)
		String userName = "홍길동";
		Long deptNm = 3001L;
		Long collegeNm = 2001L;
		Long univNm = 1001L;
		Integer grade = 2;

		User user = mock(User.class);
		when(user.getUserId()).thenReturn("alice");
		when(user.getUserNm()).thenReturn("20250001");
		when(user.getUserName()).thenReturn(userName);
		when(user.getDeptNm()).thenReturn(deptNm);
		when(user.getCollegeNm()).thenReturn(collegeNm);
		when(user.getUnivNm()).thenReturn(univNm);
		when(user.getGrade()).thenReturn(grade);
		when(user.getRole()).thenReturn(Role.STUDENT);
		when(userMapper.findByUserId("alice")).thenReturn(Optional.of(user));

		when(authTokenService.createAccessToken(
			eq("20250001"),
			eq("alice"),
			eq("STUDENT"),
			eq(userName),
			eq(deptNm),
			eq(collegeNm),
			eq(univNm),
			eq(grade)
		)).thenReturn("NEW_ACCESS");

		// ✅ refresh 토큰 생성도 AuthTokenService
		when(authTokenService.createRefreshToken(eq("20250001"), anyString()))
			.thenReturn("NEW_REFRESH");

		// 신규 refresh 파싱은 JwtUtil
		@SuppressWarnings("unchecked")
		Jws<Claims> newJws = (Jws<Claims>) mock(Jws.class);
		Claims newClaims = mock(Claims.class);
		when(newClaims.getIssuedAt()).thenReturn(new Date());
		when(newClaims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 3_600_000));
		when(newJws.getPayload()).thenReturn(newClaims);
		when(jwtUtil.parse("NEW_REFRESH")).thenReturn(newJws);

		AuthResponse res = authService.refresh(req);

		assertThat(res.getAccessToken()).isEqualTo("NEW_ACCESS");
		assertThat(res.getRefreshToken()).isEqualTo("NEW_REFRESH");
		verify(refreshTokenMapper).revokeByToken(oldJti);
		verify(refreshTokenMapper).insert(any(RefreshToken.class));
	}

	@Test
	@DisplayName("refresh 실패: 토큰이 유효하지 않으면 예외")
	void refresh_fail_invalid_token() {
		RefreshRequest req = RefreshRequest.builder()
			.refreshToken("BAD")
			.build();

		when(jwtUtil.validateToken("BAD")).thenReturn(false);

		assertThatThrownBy(() -> authService.refresh(req))
			.isInstanceOf(RuntimeException.class)
			.hasMessageContaining("Invalid Refresh Token");
		verify(refreshTokenMapper, never()).insert(any());
	}

	@Test
	@DisplayName("refresh 실패: DB에 활성 토큰이 없으면 예외")
	void refresh_fail_not_found_in_db() {
		String oldRefresh = "OLD_REFRESH";
		String oldJti = "old-jti";
		RefreshRequest req = RefreshRequest.builder()
			.refreshToken(oldRefresh)
			.build();

		when(jwtUtil.validateToken(oldRefresh)).thenReturn(true);
		when(jwtUtil.isRefresh(oldRefresh)).thenReturn(true);

		@SuppressWarnings("unchecked") Jws<Claims> jws = (Jws<Claims>) mock(Jws.class);
		Claims claims = mock(Claims.class);
		when(claims.getId()).thenReturn(oldJti);
		when(jws.getPayload()).thenReturn(claims);
		when(jwtUtil.parse(oldRefresh)).thenReturn(jws);

		when(refreshTokenMapper.findActiveByToken(oldJti)).thenReturn(null);

		assertThatThrownBy(() -> authService.refresh(req))
			.isInstanceOf(RuntimeException.class)
			.hasMessageContaining("not found or revoked");
		verify(refreshTokenMapper, never()).insert(any());
	}

	// ====== logout() ======
	@Test
	@DisplayName("logout: 유효한 리프레시 토큰이면 revokeByToken 호출")
	void logout_valid_refresh_revokes() {
		String refresh = "REFRESH";
		String jti = "jti-123";

		LogoutRequest req = LogoutRequest.builder()
			.refreshToken(refresh)
			.build();

		when(jwtUtil.validateToken(refresh)).thenReturn(true);
		when(jwtUtil.isRefresh(refresh)).thenReturn(true);

		@SuppressWarnings("unchecked") Jws<Claims> jws = (Jws<Claims>) mock(Jws.class);
		Claims claims = mock(Claims.class);
		when(claims.getId()).thenReturn(jti);
		when(jws.getPayload()).thenReturn(claims);
		when(jwtUtil.parse(refresh)).thenReturn(jws);

		authService.logout(req);

		verify(refreshTokenMapper).revokeByToken(jti);
	}

	@Test
	@DisplayName("logout: 무효 토큰/예외 발생 시 무시")
	void logout_ignores_invalid() {
		LogoutRequest req = LogoutRequest.builder()
			.refreshToken("X")
			.build();

		when(jwtUtil.validateToken("X")).thenReturn(false);

		authService.logout(req);

		verify(refreshTokenMapper, never()).revokeByToken(anyString());
	}

	// ====== requestPasswordReset() ======
	@Test
	@DisplayName("requestPasswordReset: 사용자 존재 시 userKey 업데이트 성공")
	void requestPasswordReset_success() {
		PasswordResetRequest req = PasswordResetRequest.builder()
			.userId("alice")
			.build();

		when(userMapper.findByUserId("alice")).thenReturn(Optional.of(mock(User.class)));
		when(userMapper.updateUserKeyByUserId(eq("alice"), anyString())).thenReturn(1);

		authService.requestPasswordReset(req);

		verify(userMapper).updateUserKeyByUserId(eq("alice"), anyString());
	}

	@Test
	@DisplayName("requestPasswordReset: 사용자 없으면 UsernameNotFoundException")
	void requestPasswordReset_user_not_found() {
		PasswordResetRequest req = PasswordResetRequest.builder()
			.userId("nope")
			.build();

		when(userMapper.findByUserId("nope")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.requestPasswordReset(req))
			.isInstanceOf(UsernameNotFoundException.class);
	}

	// ====== confirmPasswordReset() ======
	@Test
	@DisplayName("confirmPasswordReset: 토큰 유효 → 비밀번호 변경, userKey 클리어, 모든 refresh revoke")
	void confirmPasswordReset_success() {
		PasswordResetConfirmRequest req = PasswordResetConfirmRequest.builder()
			.token("T-123456")
			.newPassword("NewP@ssw0rd!")
			.build();

		User user = mock(User.class);
		when(user.getUserId()).thenReturn("alice");
		when(user.getUserNm()).thenReturn("20250001");

		when(userMapper.findByUserKey("T-123456")).thenReturn(Optional.of(user));
		when(passwordEncoder.encode("NewP@ssw0rd!")).thenReturn("ENC");
		when(userMapper.updatePasswordByUserId("alice", "ENC")).thenReturn(1);

		authService.confirmPasswordReset(req);

		verify(userMapper).clearUserKeyByUserKey("T-123456");
		verify(refreshTokenMapper).revokeAllByUserNm("20250001");
	}

	@Test
	@DisplayName("confirmPasswordReset: 토큰 불일치/만료 → IllegalArgumentException")
	void confirmPasswordReset_invalid_token() {
		PasswordResetConfirmRequest req = PasswordResetConfirmRequest.builder()
			.token("BAD")
			.newPassword("x")
			.build();

		when(userMapper.findByUserKey("BAD")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.confirmPasswordReset(req))
			.isInstanceOf(IllegalArgumentException.class);
		verify(userMapper, never()).updatePasswordByUserId(anyString(), anyString());
	}
}
