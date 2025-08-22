package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그아웃 요청을 위한 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LogoutRequest {
	// 무효화할 리프레시 토큰
	private String refreshToken;
}
