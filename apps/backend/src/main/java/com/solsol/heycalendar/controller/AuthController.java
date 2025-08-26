package com.solsol.heycalendar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.dto.request.AuthRequest;
import com.solsol.heycalendar.dto.request.LogoutRequest;
import com.solsol.heycalendar.dto.request.PasswordResetConfirmRequest;
import com.solsol.heycalendar.dto.request.PasswordResetRequest;
import com.solsol.heycalendar.dto.request.RefreshRequest;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.service.AuthService;

import jakarta.validation.Valid;

/**
 * 인증 관련 API (로그인, 로그아웃, 토큰 재발급, 비밀번호 재설정)를 처리하는 컨트롤러입니다.
 * 헤더명과 토큰 프리픽스는 환경설정(JwtProperties)에서 주입받아 캐싱합니다.
 * 프리픽스의 공백 유무에 관계없이 항상 "Bearer <token>" 형태가 되도록 buildAuthHeader()로 표준화합니다.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final JwtProperties props;

	private final String headerName;
	private final String tokenPrefix;

	public AuthController(AuthService authService, JwtProperties props) {
		this.authService = authService;
		this.props = props;
		this.headerName = props.getJwt().getHeaderString();
		this.tokenPrefix = props.getJwt().getTokenPrefix();
	}

	/**
	 * 토큰 헤더 값을 표준화합니다.
	 * tokenPrefix가 "Bearer"이든 "Bearer "이든 항상 "Bearer <token>" 형태가 되도록 보장합니다.
	 *
	 * @param accessToken 액세스 토큰
	 * @return Authorization 헤더에 사용할 값
	 */
	private String buildAuthHeader(String accessToken) {
		return tokenPrefix.endsWith(" ")
			? tokenPrefix + accessToken
			: tokenPrefix + " " + accessToken;
	}

	/**
	 * 사용자의 로그인을 처리하고, 성공 시 액세스 토큰과 리프레시 토큰을 발급합니다.
	 *
	 * @param authRequest 로그인 요청 DTO (사용자 ID, 비밀번호)
	 * @return 발급된 토큰 정보를 포함하는 응답
	 */
	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest authRequest) {
		AuthResponse authResponse = authService.login(authRequest);
		return ResponseEntity.ok()
			.header(headerName, buildAuthHeader(authResponse.getAccessToken()))
			.body(ApiResponse.success("로그인에 성공했습니다.", authResponse));
	}


	/**
	 * 사용자의 로그아웃을 처리합니다. 서버에 저장된 리프레시 토큰을 무효화합니다.
	 *
	 * @param logoutRequest 로그아웃 요청 DTO (리프레시 토큰)
	 * @return 작업 성공 여부를 포함하는 응답
	 */
	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody LogoutRequest logoutRequest) {
		authService.logout(logoutRequest);
		return ResponseEntity.ok(ApiResponse.success("로그아웃 되었습니다.", null));
	}

	/**
	 * 만료된 액세스 토큰을 새로운 토큰으로 재발급합니다.
	 *
	 * @param refreshRequest 재발급 요청 DTO (리프레시 토큰)
	 * @return 새로 발급된 토큰 정보를 포함하는 응답
	 */
	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest refreshRequest) {
		AuthResponse authResponse = authService.refresh(refreshRequest);
		return ResponseEntity.ok()
			.header(headerName, buildAuthHeader(authResponse.getAccessToken()))
			.body(ApiResponse.success("토큰이 성공적으로 재발급되었습니다.", authResponse));
	}

	/**
	 * 비밀번호 재설정 요청 엔드포인트입니다.
	 *
	 * @param request 비밀번호 재설정 요청 DTO
	 * @return ResponseEntity<ApiResponse<Void>>
	 */
	@PostMapping("/password/reset/request")
	public ResponseEntity<ApiResponse<Void>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
		authService.requestPasswordReset(request);
		return ResponseEntity.ok(ApiResponse.success("비밀번호 재설정 요청이 완료되었습니다.", null));
	}

	/**
	 * 비밀번호 재설정 확정 엔드포인트입니다.
	 *
	 * @param request 비밀번호 재설정 확정 요청 DTO
	 * @return ResponseEntity<ApiResponse<Void>>
	 */
	@PostMapping("/password/reset/confirm")
	public ResponseEntity<ApiResponse<Void>> confirmPasswordReset(
		@Valid @RequestBody PasswordResetConfirmRequest request) {
		authService.confirmPasswordReset(request);
		return ResponseEntity.ok(ApiResponse.success("비밀번호가 성공적으로 재설정되었습니다.", null));
	}
}
