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

import jakarta.annotation.PostConstruct;
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
	private SecretKey secretKey;

	/** JWT 서명에 사용할 키 생성 */
	@PostConstruct
	void init() {
		byte[] bytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
		this.secretKey = Keys.hmacShaKeyFor(bytes);
	}
	private SecretKey key() { return this.secretKey; }

	// (1) Access Token 등 jti 없이 서명할 때 사용
	public String sign(String subject, Map<String, Object> claims, Date issuedAt, Date expiration) {
		return Jwts.builder()
			.issuer(props.getJwt().getIssuer())
			.subject(subject)
			.claims(claims)
			.issuedAt(issuedAt)
			.expiration(expiration)
			.signWith(key(), Jwts.SIG.HS256)
			.compact();
	}

	// (2) Refresh Token 등 jti가 필요한 경우 사용
	public String sign(String subject, String jti, Map<String, Object> claims, Date issuedAt, Date expiration) {
		return Jwts.builder()
			.issuer(props.getJwt().getIssuer())
			.subject(subject)
			.id(jti) // jti 설정
			.claims(claims)
			.issuedAt(issuedAt)
			.expiration(expiration)
			.signWith(key(), Jwts.SIG.HS256)
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
		} catch (WeakKeyException e) {
			log.warn("Weak JWT Secret Key.", e);
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

	public boolean isAccess(String token) {
		return "access".equals(parse(token).getPayload().get("typ", String.class)); // ✅
	}

	public boolean isRefresh(String token) {
		return "refresh".equals(parse(token).getPayload().get("typ", String.class)); // ✅
	}

	public String subjectUserNm(String token) {
		return parse(token).getPayload().getSubject();
	}

	public int getRefreshExpDays() {
		return props.getJwt().getRefreshExpDays();
	}
}
