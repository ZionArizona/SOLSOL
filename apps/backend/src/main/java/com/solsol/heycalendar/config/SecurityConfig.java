package com.solsol.heycalendar.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.solsol.heycalendar.security.CustomUserDetailsService;
import com.solsol.heycalendar.security.JwtAuthenticationEntryPoint;
import com.solsol.heycalendar.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * 애플리케이션의 보안 설정을 구성하는 클래스입니다.
 * JWT 기반 인증, CORS, CSRF, 권한 별 접근 제어 등을 설정합니다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final CustomUserDetailsService userDetailsService;
	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final JwtProperties props;

	/**
	 * HTTP 보안 필터 체인을 구성합니다.
	 *
	 * @param http HttpSecurity 객체
	 * @return SecurityFilterChain 객체
	 * @throws Exception 설정 과정에서 발생할 수 있는 예외
	 */
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// CSRF 보호 비활성화 (stateless JWT 사용)
			.csrf(csrf -> csrf.disable())
			// CORS 설정 적용
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			// 세션을 사용하지 않는 stateless 정책 설정
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			// 인증 예외 처리 핸들러 설정
			.exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint))
			// 요청 경로에 따른 접근 권한 설정
			.authorizeHttpRequests(authz -> authz
				.requestMatchers("/api/auth/**", "/api/public/**").permitAll()
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
				.requestMatchers("/actuator/health").permitAll()
				.requestMatchers("/api/admin/**").hasRole("ADMIN")
				.requestMatchers("/api/student/**").hasRole("STUDENT")
				.requestMatchers("/api/staff/**").hasRole("STAFF")
				.anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
			);

		// 커스텀 인증 프로바이더 설정
		http.authenticationProvider(authenticationProvider());
		// JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
		http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}


	/**
	 * CORS(Cross-Origin Resource Sharing) 설정을 구성합니다.
	 *
	 * @return CorsConfigurationSource 객체
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(props.getCors().getAllowedOrigins().split(",")));
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L); // Pre-flight 요청 캐시 시간 (초)

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	/**
	 * 비밀번호 암호화를 위한 PasswordEncoder 빈을 등록합니다.
	 *
	 * @return BCryptPasswordEncoder 객체
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * 사용자 인증을 처리하는 DaoAuthenticationProvider 빈을 등록합니다.
	 *
	 * @return DaoAuthenticationProvider 객체
	 */
	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}

	/**
	 * Spring Security의 인증을 총괄하는 AuthenticationManager 빈을 등록합니다.
	 *
	 * @param config AuthenticationConfiguration 객체
	 * @return AuthenticationManager 객체
	 * @throws Exception 설정 과정에서 발생할 수 있는 예외
	 */
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

}
