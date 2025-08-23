package com.solsol.heycalendar.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.solsol.heycalendar.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import javax.crypto.SecretKey;
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

	/** JWT 서명에 사용할 키 생성 */
	private SecretKey key() { // ✅ 반환 타입 SecretKey
		byte[] bytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(bytes); // 최소 32바이트 권장
	}

	/** 액세스 토큰 생성 */
	public String createAccessToken(Long userNm, String userId, String role) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getAccessExpMin() * 60L);

		return Jwts.builder()
			.issuer(props.getJwt().getIssuer())
			.subject(String.valueOf(userNm))
			.claims(Map.of("userId", userId, "role", role, "typ", "access"))
			.issuedAt(Date.from(now))
			.expiration(Date.from(exp))
			.signWith(key(), Jwts.SIG.HS256) // ✅ 0.12.x
			.compact();
	}

	/** 리프레시 토큰 생성 */
	public String createRefreshToken(Long userNm, String jti) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getRefreshExpDays() * 86400L);

		return Jwts.builder()
			.issuer(props.getJwt().getIssuer())
			.subject(String.valueOf(userNm))
			.id(jti)
			.claims(Map.of("typ", "refresh"))
			.issuedAt(Date.from(now))
			.expiration(Date.from(exp))
			.signWith(key(), Jwts.SIG.HS256) // ✅
			.compact();
	}

	/** 서명된 JWS 파싱 */
	public Jws<Claims> parse(String token) {
		return Jwts.parser()
			.verifyWith(key()) // ✅ SecretKey 필요
			.build()
			.parseSignedClaims(token);
	}

	public String extractUserId(String token) {
		return parse(token).getPayload().get("userId", String.class); // ✅ getPayload()
	}

	public boolean isTokenExpired(String token) {
		try {
			return parse(token).getPayload().getExpiration().before(new Date()); // ✅
		} catch (ExpiredJwtException e) {
			return true;
		} catch (Exception e) {
			return true;
		}
	}

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
		} catch (WeakKeyException e) {
			log.warn("Weak JWT Secret Key.", e);
		}
		return false;
	}

	public boolean isAccess(String token) {
		return "access".equals(parse(token).getPayload().get("typ", String.class)); // ✅
	}

	public boolean isRefresh(String token) {
		return "refresh".equals(parse(token).getPayload().get("typ", String.class)); // ✅
	}

	public Long subjectUserNm(String token) {
		return Long.valueOf(parse(token).getPayload().getSubject());
	}
}
