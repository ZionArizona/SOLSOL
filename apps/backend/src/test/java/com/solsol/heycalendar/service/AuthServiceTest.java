package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.RefreshToken;
import com.solsol.heycalendar.dto.request.AuthRequest;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.mapper.RefreshTokenMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AuthService.login()의 정상 발급 플로우를 검증하는 단위 테스트.
 */
@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AuthServiceTest {

	@Mock AuthenticationManager authenticationManager;
	@Mock JwtUtil jwtUtil;
	@Mock UserMapper userMapper;               // login()에서는 직접 사용 X (refresh()에서 사용)
	@Mock RefreshTokenMapper refreshTokenMapper;

	@InjectMocks AuthService authService;

	@BeforeEach
	void setupRequestContext() {
		// AuthService.login() 내부에서 RequestContextHolder를 사용하므로 mock request 세팅
		MockHttpServletRequest request = new MockHttpServletRequest();
		request.addHeader("User-Agent", "JUnit");
		request.setRemoteAddr("127.0.0.1");
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
	}

	@Test
	@DisplayName("로그인 성공 시 액세스/리프레시 토큰을 발급하고 RefreshToken을 저장한다")
	void login_success() {
		// given
		AuthRequest req = AuthRequest.builder()
			.userId("alice")
			.password("password1!")
			.build();

		// CustomUserPrincipal mocking
		CustomUserPrincipal principal = mock(CustomUserPrincipal.class);
		when(principal.getUserNm()).thenReturn("20250001");  // 학번 String (B안)
		when(principal.getUserId()).thenReturn("alice");
		when(principal.getRole()).thenReturn("STUDENT");     // enum이라면 getRole().name()으로 맞추세요

		Authentication auth = mock(Authentication.class);
		when(auth.getPrincipal()).thenReturn(principal);
		when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);

		// JwtUtil 동작 mocking
		when(jwtUtil.createAccessToken("20250001", "alice", "STUDENT"))
			.thenReturn("ACCESS_TOKEN_EXAMPLE");

		when(jwtUtil.createRefreshToken(eq("20250001"), anyString()))
			.thenReturn("REFRESH_TOKEN_EXAMPLE");

		// parse(refresh) → issuedAt/expiration 필요
		@SuppressWarnings("unchecked")
		Jws<Claims> jws = (Jws<Claims>) mock(Jws.class);
		Claims claims = mock(Claims.class);
		when(claims.getIssuedAt()).thenReturn(new Date());
		when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 3_600_000));
		when(jws.getPayload()).thenReturn(claims);
		when(jwtUtil.parse("REFRESH_TOKEN_EXAMPLE")).thenReturn(jws);

		// when
		AuthResponse res = authService.login(req);

		// then
		assertThat(res.getAccessToken()).isEqualTo("ACCESS_TOKEN_EXAMPLE");
		assertThat(res.getRefreshToken()).isEqualTo("REFRESH_TOKEN_EXAMPLE");

		// RefreshToken 저장 호출 검증
		verify(refreshTokenMapper, times(1)).insert(any(RefreshToken.class));
		verifyNoMoreInteractions(refreshTokenMapper);
	}
}
