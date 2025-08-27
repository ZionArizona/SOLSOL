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
import com.solsol.heycalendar.dto.request.SignupRequest;
import com.solsol.heycalendar.dto.response.AuthResponse;
import com.solsol.heycalendar.dto.response.SignupResponse;
import com.solsol.heycalendar.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "인증 관리", description = "로그인, 로그아웃, 토큰 관리 및 비밀번호 재설정 API")
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

	@Operation(
		summary = "로그인",
		description = "사용자 ID와 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.",
		security = {}
	)
	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest authRequest) {
		AuthResponse authResponse = authService.login(authRequest);

		return ResponseEntity.ok()
			.header(headerName, tokenPrefix + " " + authResponse.getAccessToken())
			.body(new ApiResponse<>(true, "Login successful.", "OK", authResponse));
	}
	@Operation(summary = "로그아웃", description = "로그아웃 처리 및 리프레시 토큰 무효화를 수행합니다.")
	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(@RequestBody LogoutRequest logoutRequest) {
		authService.logout(logoutRequest);
		return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful.", "OK", null));
	}

	@Operation(summary = "토큰 재발급", description = "만료된 액세스 토큰을 리프레시 토큰으로 갱신합니다.")
	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest refreshRequest) {
		AuthResponse authResponse = authService.refresh(refreshRequest);

		return ResponseEntity.ok()
			.header(headerName, tokenPrefix + " " + authResponse.getAccessToken())
			.body(new ApiResponse<>(true, "Tokens refreshed successfully.", "OK", authResponse));
	}

	@Operation(summary = "비밀번호 재설정 요청", description = "비밀번호 재설정을 위한 인증 코드를 요청합니다.")
	@PostMapping("/password/reset/request")
	public ResponseEntity<ApiResponse<Void>> requestPasswordReset(@RequestBody PasswordResetRequest request) {
		authService.requestPasswordReset(request);
		return ResponseEntity.ok(ApiResponse.success("Password reset request successful", null));
	}

	@Operation(summary = "비밀번호 재설정 확인", description = "인증 코드로 비밀번호 재설정을 확정 처리합니다.")
	@PostMapping("/password/reset/confirm")
	public ResponseEntity<ApiResponse<Void>> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest request) {
		authService.confirmPasswordReset(request);
		return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
	}

	/**
	 * 회원가입을 처리합니다. 신한은행 API와 연동하여 사용자 계정 및 계좌를 생성합니다.
	 *
	 * @param signupRequest 회원가입 요청 DTO
	 * @return ResponseEntity<ApiResponse<SignupResponse>>
	 */
	@PostMapping("/signup")
	@Operation(
		summary = "회원가입", 
		description = "신한은행 API와 연동하여 사용자 계정 및 계좌를 생성합니다.",
		security = {}
	)
	@ApiResponses(value = {
		@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "회원가입 성공"),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
	})
	public ResponseEntity<ApiResponse<SignupResponse>> signup(@RequestBody SignupRequest signupRequest) {
		SignupResponse signupResponse = authService.signup(signupRequest);
		return ResponseEntity.ok(new ApiResponse<>(true, "Signup successful.", "OK", signupResponse));
	}
}
