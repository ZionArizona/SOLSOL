package com.solsol.heycalendar.security;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.solsol.heycalendar.config.JwtProperties;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT(JSON Web Token) 생성, 검증, 파싱 등 관련 유틸리티 클래스
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {
	private final JwtProperties props;

	/**
	 * JWT 서명에 사용할 키를 생성
	 * @return 서명 키
	 */
	private SecretKey key() {
		return Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes());
	}

	/**
	 * 액세스 토큰을 생성
	 *
	 * @param userNm 사용자 이름
	 * @param userId 사용자 ID
	 * @param role   사용자 역할
	 * @return 생성된 액세스 토큰 문자열
	 */
	public String createAccessToken(Long userNm, String userId, String role) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getAccessExpMin() * 60L);
		return Jwts.builder()
			.setIssuer(props.getJwt().getIssuer())
			.setSubject(String.valueOf(userNm))
			.addClaims(Map.of("userId", userId, "role", role, "typ", "access"))
			.setIssuedAt(Date.from(now))
			.setExpiration(Date.from(exp))
			.signWith(key(), SignatureAlgorithm.HS256)
			.compact();
	}

	/**
	 * 리프레시 토큰을 생성
	 *
	 * @param userNm 사용자 이름
	 * @param jti    JWT 고유 식별자 (JTI)
	 * @return 생성된 리프레시 토큰 문자열
	 */
	public String createRefreshToken(Long userNm, String jti) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getRefreshExpDays() * 86400L);
		return Jwts.builder()
			.setIssuer(props.getJwt().getIssuer())
			.setSubject(String.valueOf(userNm))
			.setId(jti)
			.addClaims(Map.of("typ", "refresh"))
			.setIssuedAt(Date.from(now))
			.setExpiration(Date.from(exp))
			.signWith(key(), SignatureAlgorithm.HS256)
			.compact();
	}

	/**
	 * 토큰을 파싱하여 JWS(JSON Web Signature) Claims 객체를 반환
	 *
	 * @param token 파싱할 토큰 문자열
	 * @return 파싱된 JWS Claims 객체
	 */
	public Jws<Claims> parse(String token) {
		return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token);
	}

	/**
	 * 토큰에서 사용자 ID를 추출
	 *
	 * @param token 토큰 문자열
	 * @return 추출된 사용자 ID
	 */
	public String extractUserId(String token) {
		return parse(token).getBody().get("userId", String.class);
	}

	/**
	 * 토큰의 만료 여부를 확인
	 *
	 * @param token 토큰 문자열
	 * @return 만료되었으면 true, 아니면 false
	 */
	public boolean isTokenExpired(String token) {
		try {
			return parse(token).getBody().getExpiration().before(new Date());
		} catch (ExpiredJwtException e) {
			return true;
		} catch (Exception e) {
			return true;
		}
	}

	/**
	 * 토큰의 유효성을 검증 (서명, 만료일 등)
	 *
	 * @param token 검증할 토큰 문자열
	 * @return 유효하면 true, 아니면 false
	 */
	public boolean validateToken(String token) {
		try {
			parse(token);
			return true;
		} catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
			log.info("Invalid JWT Token", e);
		} catch (ExpiredJwtException e) {
			log.info("Expired JWT Token", e);
		} catch (UnsupportedJwtException e) {
			log.info("Unsupported JWT Token", e);
		} catch (IllegalArgumentException e) {
			log.info("JWT claims string is empty.", e);
		}
		return false;
	}

	/**
	 * 토큰이 액세스 토큰인지 확인
	 *
	 * @param token 토큰 문자열
	 * @return 액세스 토큰이면 true, 아니면 false
	 */
	public boolean isAccess(String token) {
		return "access".equals(parse(token).getBody().get("typ", String.class));
	}

	/**
	 * 토큰이 리프레시 토큰인지 확인
	 *
	 * @param token 토큰 문자열
	 * @return 리프레시 토큰이면 true, 아니면 false
	 */
	public boolean isRefresh(String token) {
		return "refresh".equals(parse(token).getBody().get("typ", String.class));
	}

	/**
	 * 토큰의 subject(사용자 이름)를 추출
	 *
	 * @param token 토큰 문자열
	 * @return 추출된 사용자 이름 (Long 타입)
	 */
	public Long subjectUserNm(String token) {
		return Long.valueOf(parse(token).getBody().getSubject());
	}

}
