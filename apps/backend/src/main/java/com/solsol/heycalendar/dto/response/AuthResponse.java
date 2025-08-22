package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 또는 토큰 재발급 성공 시 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	// 발급된 액세스 토큰
	private String accessToken;
	// 발급된 리프레시 토큰
	private String refreshToken;
}
