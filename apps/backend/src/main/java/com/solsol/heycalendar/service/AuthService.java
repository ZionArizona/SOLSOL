package com.solsol.heycalendar.service;

import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.domain.RefreshToken;
import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.dto.request.AuthRequest;
import com.solsol.heycalendar.dto.request.LogoutRequest;
import com.solsol.heycalendar.dto.request.RefreshReqeust;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.mapper.RefreshTokenMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserMapper userMapper;
	private final RefreshTokenMapper refreshTokenMapper;

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

		String accessToken = jwtUtil.createAccessToken(principal.getUserNm(), principal.getUserId(), principal.getRole());

		String jti = UUID.randomUUID().toString();
		String refreshTokenString = jwtUtil.createRefreshToken(principal.getUserNm(), jti);

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
	 * 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급 (토큰 순환)
	 *
	 * @param refreshRequest 재발급 요청 정보 (리프레시 토큰)
	 * @return 새로 발급된 액세스 토큰과 리프레시 토큰
	 * @throws RuntimeException 유효하지 않은 리프레시 토큰이거나 DB에 존재하지 않을 경우
	 */
	@Transactional
	public AuthResponse refresh(RefreshReqeust refreshRequest) {
		String oldRefreshTokenString = refreshRequest.getRefreshToken();

		if (!jwtUtil.validateToken(oldRefreshTokenString) || !jwtUtil.isRefresh(oldRefreshTokenString)) {
			throw new RuntimeException("Invalid Refresh Token");
		}

		String jti = jwtUtil.parse(oldRefreshTokenString).getBody().getId();
		RefreshToken oldRefreshToken = refreshTokenMapper.findActiveByToken(jti);

		if (oldRefreshToken == null) {
			throw new RuntimeException("Refresh token not found or revoked.");
		}

		refreshTokenMapper.revokeByToken(jti);

		User user = userMapper.findByUserId(oldRefreshToken.getUserId())
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		String role = user.getRole() != null ? user.getRole().name() : "STUDENT";
		String newAccessToken = jwtUtil.createAccessToken(user.getUserNm(), user.getUserId(), role);

		String newJti = UUID.randomUUID().toString();
		String newRefreshTokenString = jwtUtil.createRefreshToken(user.getUserNm(), newJti);

		Claims newRefreshClaims = jwtUtil.parse(newRefreshTokenString).getPayload();

		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

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
}
