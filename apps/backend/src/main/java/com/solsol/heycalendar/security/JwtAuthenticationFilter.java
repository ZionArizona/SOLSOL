package com.solsol.heycalendar.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.solsol.heycalendar.config.JwtProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 모든 HTTP 요청에 대해 JWT 토큰을 검증하고, 유효한 경우 인증 정보를 SecurityContext에 설정하는 필터
 * Spring Security의 OncePerRequestFilter를 상속하여 요청당 한 번만 실행되도록 보장
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtUtil jwtUtil;
	private final CustomUserDetailsService userDetailsService;
	private final JwtProperties jwtProperties;

	/**
	 * 실제 필터링 로직을 수행
	 * 요청 헤더에서 JWT 토큰을 추출하고, 유효성을 검사한 뒤,
	 * 해당 사용자의 인증 정보를 SecurityContext에 설정
	 *
	 * @param request      HTTP 요청
	 * @param response     HTTP 응답
	 * @param filterChain  필터 체인
	 * @throws ServletException 서블릿 예외
	 * @throws IOException      입출력 예외
	 */
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {

		try {
			String jwt = getJwtFromRequest(request);

			if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
				String userId = jwtUtil.extractUserId(jwt);

				UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

				UsernamePasswordAuthenticationToken authentication =
					new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		} catch (Exception ex) {
			log.error("Could not set user authentication in security context", ex);
		}

		filterChain.doFilter(request, response);
	}

	/**
	 * HttpServletRequest에서 'Authorization' 헤더를 파싱하여 JWT 토큰을 추출
	 *
	 * @param request HTTP 요청
	 * @return 추출된 JWT 토큰 문자열, 없거나 형식이 맞지 않으면 null
	 */
	private String getJwtFromRequest(HttpServletRequest request) {
		String headerName = jwtProperties.getJwt().getHeaderString(); // e.g. "Authorization"
		if (!StringUtils.hasText(headerName)) return null;

		String headerVal = request.getHeader(headerName);
		String prefix = jwtProperties.getJwt().getNormalizedTokenPrefix(); // "Bearer" → "Bearer"
		if (!StringUtils.hasText(headerVal) || !StringUtils.hasText(prefix)) return null;

		String lowerHeader = headerVal.toLowerCase();
		String lowerPrefix = prefix.toLowerCase();

		if (!lowerHeader.startsWith(lowerPrefix)) return null;

		String after = headerVal.substring(prefix.length()).stripLeading(); // 공백 유연 처리
		return after.isEmpty() ? null : after;
	}


}
