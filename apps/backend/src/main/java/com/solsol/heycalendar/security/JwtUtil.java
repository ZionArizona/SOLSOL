package com.solsol.heycalendar.security;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.solsol.heycalendar.config.JwtProperties;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtUtil {
	private final JwtProperties props;

	private Key key() {
		return Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes());
	}

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

	public Jws<Claims> parse(String token) {
		return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
	}

	public boolean validateToken(String token, String expectedUserId) {
		try {
			var claims = parse(token).getBody();
			String typ = claims.get("typ", String.class);
			String userId = claims.get("userId", String.class);
			return userId != null && userId.equals(expectedUserId) && (typ.equals("access") || typ.equals("refresh"));
		} catch (Exception e) {
			return false;
		}
	}

	public boolean isAccess(String token) {
		return "access".equals(parse(token).getBody().get("typ", String.class));
	}

	public boolean isRefresh(String token) {
		return "refresh".equals(parse(token).getBody().get("typ", String.class));
	}

	public Long subjectUserNm(String token) {
		return Long.valueOf(parse(token).getBody().getSubject());
	}

}
