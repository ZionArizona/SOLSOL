package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.RefreshToken;
import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.dto.request.AuthRequest;
import com.solsol.heycalendar.dto.request.LogoutRequest;
import com.solsol.heycalendar.dto.request.PasswordResetConfirmRequest;
import com.solsol.heycalendar.dto.request.PasswordResetRequest;
import com.solsol.heycalendar.dto.request.RefreshRequest;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.mapper.RefreshTokenMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import com.solsol.heycalendar.security.AuthTokenService;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;
import java.security.SecureRandom;
/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final AuthTokenService authTokenService;
	private final UserMapper userMapper;
	private final RefreshTokenMapper refreshTokenMapper;
	private final PasswordEncoder passwordEncoder;

	/**
	 * 사용자 로그인을 처리하고 토큰을 발급
	 *
	 * @param authRequest 로그인 요청 정보 (ID, 비밀번호)
	 * @return 발급된 액세스 토큰과 리프레시 토큰
	 */
	@Transactional
	public AuthResponse login(AuthRequest authRequest) {
		Authentication authentication = authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(
				authRequest.getUserId(),
				authRequest.getPassword()
			)
		);

		CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

		String accessToken = authTokenService.createAccessToken(
			principal.getUserNm(),
			principal.getUserId(),
			principal.getRole(),
			principal.getUsername(),
			principal.getDeptNm(),
			principal.getCollegeNm(),
			principal.getUnivNm(),
			principal.getGrade()
		);

		String jti = UUID.randomUUID().toString();
		String refreshTokenString = authTokenService.createRefreshToken(principal.getUserNm(), jti);

		Claims refreshClaims = jwtUtil.parse(refreshTokenString).getPayload();

		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

		RefreshToken refreshToken = RefreshToken.builder()
			.userNm(principal.getUserNm())
			.userId(principal.getUserId())
			.token(jti)
			.issuedAt(toLocalDateTime(refreshClaims.getIssuedAt()))
			.expiresAt(toLocalDateTime(refreshClaims.getExpiration()))
			.revoked(false)
			.userAgent(request.getHeader("User-Agent"))
			.ip(request.getRemoteAddr())
			.build();

		refreshTokenMapper.insert(refreshToken);

		return new AuthResponse(accessToken, refreshTokenString);
	}

	/**
	 * 리프레시 토큰으로 새로운 액세스/리프레시 토큰을 발급(토큰 순환)
	 * - 액세스 토큰 클레임: userId, role, typ=access, userName, deptNm, collegeNm, univNm, grade
	 */
	@Transactional
	public AuthResponse refresh(RefreshRequest refreshRequest) {
		String oldRefreshTokenString = refreshRequest.getRefreshToken();

		// 1) 형식/유형 검증
		if (!jwtUtil.validateToken(oldRefreshTokenString) || !jwtUtil.isRefresh(oldRefreshTokenString)) {
			throw new RuntimeException("Invalid Refresh Token");
		}

		// 2) DB에서 활성 리프레시 토큰 찾기
		String jti = jwtUtil.parse(oldRefreshTokenString).getPayload().getId();
		RefreshToken oldRefreshToken = refreshTokenMapper.findActiveByToken(jti);
		if (oldRefreshToken == null) {
			throw new RuntimeException("Refresh token not found or revoked.");
		}

		// 3) 기존 리프레시 토큰 무효화
		refreshTokenMapper.revokeByToken(jti);

		// 4) 사용자 조회
		User user = userMapper.findByUserId(oldRefreshToken.getUserId())
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		// 5) 새 액세스 토큰 생성 (로그인과 동일한 클레임 포함)
		String role = user.getRole() != null ? user.getRole().name() : "STUDENT";
		String newAccessToken = authTokenService.createAccessToken(
			user.getUserNm(),
			user.getUserId(),
			role,
			user.getUserName(),
			user.getDeptNm(),
			user.getCollegeNm(),
			user.getUnivNm(),
			user.getGrade()
		);

		// 6) 새 리프레시 토큰 생성 + 저장
		String newJti = java.util.UUID.randomUUID().toString();
		String newRefreshTokenString = authTokenService.createRefreshToken(user.getUserNm(), newJti);

		Claims newRefreshClaims = jwtUtil.parse(newRefreshTokenString).getPayload();

		jakarta.servlet.http.HttpServletRequest request =
			((org.springframework.web.context.request.ServletRequestAttributes)
				org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes())
				.getRequest();

		RefreshToken newRefreshToken = RefreshToken.builder()
			.userNm(user.getUserNm())
			.userId(user.getUserId())
			.token(newJti)
			.issuedAt(toLocalDateTime(newRefreshClaims.getIssuedAt()))
			.expiresAt(toLocalDateTime(newRefreshClaims.getExpiration()))
			.revoked(false)
			.userAgent(request.getHeader("User-Agent"))
			.ip(request.getRemoteAddr())
			.rotatedFrom(jti)
			.build();

		refreshTokenMapper.insert(newRefreshToken);

		// 7) 반환
		return new AuthResponse(newAccessToken, newRefreshTokenString);
	}


	/**
	 * 사용자 로그아웃을 처리합니다. 전달받은 리프레시 토큰을 무효화
	 *
	 * @param logoutRequest 로그아웃 요청 정보 (리프레시 토큰)
	 */
	@Transactional
	public void logout(LogoutRequest logoutRequest) {
		String refreshTokenString = logoutRequest.getRefreshToken();

		if (refreshTokenString == null || refreshTokenString.isEmpty()) {
			return;
		}

		try {
			if (jwtUtil.validateToken(refreshTokenString) && jwtUtil.isRefresh(refreshTokenString)) {
				String jti = jwtUtil.parse(refreshTokenString).getPayload().getId();
				refreshTokenMapper.revokeByToken(jti);
			}
		} catch (Exception e) {
			// 로그아웃 시 발생하는 토큰 관련 오류는 무시합니다.
		}
	}

	/**
	 * Date 객체를 LocalDateTime 객체로 변환
	 *
	 * @param date 변환할 Date 객체
	 * @return 변환된 LocalDateTime 객체
	 */
	private LocalDateTime toLocalDateTime(Date date) {
		if (date == null) return null;
		return Instant.ofEpochMilli(date.getTime())
			.atZone(ZoneId.systemDefault())
			.toLocalDateTime();
	}

	/**
	 * 비밀번호 재설정(요청): 임시코드를 발급하여 User.userKey에 저장.
	 * 일반적으로는 이메일/SMS 발송이 추가된다.
	 */
	@Transactional
	public void requestPasswordReset(PasswordResetRequest request) {
		final String userId = request.getUserId();

		// 1) 사용자 존재 여부 확인
		userMapper.findByUserId(userId)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

		// 2) 임시 코드(또는 토큰) 생성 - 여기서는 6자리 숫자 코드 사용
		String token = generateResetCode(6);

		// 3) userKey에 저장
		int updated = userMapper.updateUserKeyByUserId(userId, token);
		if (updated != 1) {
			throw new IllegalStateException("Failed to store reset token.");
		}

		// 4) 이메일/SMS 발송 연동 지점
		log.info("[PasswordReset][request] userId={}, token={}", userId, token);
	}

	/**
	 * 비밀번호 재설정(확정): token(User.userKey) 검증 후 비밀번호를 새로 저장.
	 * 성공 시 userKey를 null 로 클리어.
	 */
	@Transactional
	public void confirmPasswordReset(PasswordResetConfirmRequest request) {
		final String token = request.getToken();
		final String rawNewPassword = request.getNewPassword();

		// 1) 토큰으로 사용자 조회
		User user = userMapper.findByUserKey(token)
			.orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

		// 2) 비밀번호 해시 저장
		String encoded = passwordEncoder.encode(rawNewPassword);
		int updated = userMapper.updatePasswordByUserId(user.getUserId(), encoded);
		if (updated != 1) {
			throw new IllegalStateException("Failed to update password.");
		}

		// 3) 토큰 제거
		userMapper.clearUserKeyByUserKey(token);

		// 4) (선택) 해당 사용자의 모든 활성 리프레시 토큰 무효화 → 강제 재로그인 유도
		try {
			// B안: userNm은 VARCHAR(20) → String 타입으로 맞추세요.
			refreshTokenMapper.revokeAllByUserNm(user.getUserNm());
		} catch (Exception ex) {
			log.warn("[PasswordReset][confirm] revokeAllByUserNm failed: userNm={}", user.getUserNm(), ex);
		}

		log.info("[PasswordReset][confirm] userId={} password reset completed", user.getUserId());
	}

	/**
	 * 비밀번호 재설정용 숫자 코드 생성기.
	 * SecureRandom 기반으로 len자리 숫자 토큰을 생성합니다.
	 * @param len 생성할 자리수 (예: 6)
	 * @return 숫자 토큰 문자열
	 */
	private static final char[] RESET_DIGITS = "0123456789".toCharArray();
	private static final SecureRandom RESET_RAND = new SecureRandom();

	private String generateResetCode(int len) {
		char[] buf = new char[len];
		for (int i = 0; i < len; i++) {
			buf[i] = RESET_DIGITS[RESET_RAND.nextInt(RESET_DIGITS.length)];
		}
		return new String(buf);
	}
}
