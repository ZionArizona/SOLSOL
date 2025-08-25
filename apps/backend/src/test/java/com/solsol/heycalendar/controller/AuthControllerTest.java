package com.solsol.heycalendar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.dto.request.AuthRequest;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.security.JwtAuthenticationFilter; // ← 실제 경로로
import com.solsol.heycalendar.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
	controllers = AuthController.class,
	excludeAutoConfiguration = {
		SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class
	},
	excludeFilters = @Filter(
		type = FilterType.ASSIGNABLE_TYPE,
		classes = com.solsol.heycalendar.config.SecurityConfig.class
	)
)
@AutoConfigureMockMvc(addFilters = false) // 시큐리티 필터 체인 비활성화
@Import(AuthControllerTest.TestJwtPropsConfig.class)
class AuthControllerTest {

	@TestConfiguration
	static class TestJwtPropsConfig {
		@Bean
		JwtProperties jwtProperties() {
			JwtProperties p = new JwtProperties();
			p.getJwt().setHeaderString("Authorization");
			p.getJwt().setTokenPrefix("Bearer");
			// 필요하면 만료/issuer 등도 세팅 가능
			p.getJwt().setIssuer("heycalendar");
			p.getJwt().setAccessExpMin(30);
			p.getJwt().setRefreshExpDays(7);
			return p;
		}
	}

	@Autowired MockMvc mockMvc;
	@Autowired ObjectMapper objectMapper;

	@MockBean AuthService authService;

	// ✅ 필터 자체를 MockBean으로 등록해서 빈 생성 시 의존성( JwtUtil 등 )을 타지 않게 함
	@MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

	@Test
	@DisplayName("로그인 성공 시 200과 토큰 반환")
	void login_success() throws Exception {
		AuthRequest req = AuthRequest.builder()
			.userId("alice")
			.password("password1!")
			.build();

		Mockito.when(authService.login(any()))
			.thenReturn(new AuthResponse("ACCESS_TOKEN_EXAMPLE", "REFRESH_TOKEN_EXAMPLE"));

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(req)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.data.accessToken").value("ACCESS_TOKEN_EXAMPLE"))
			.andExpect(jsonPath("$.data.refreshToken").value("REFRESH_TOKEN_EXAMPLE"));
	}
}
