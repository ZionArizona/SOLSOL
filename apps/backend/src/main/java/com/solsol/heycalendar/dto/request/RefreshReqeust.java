package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 토큰 재발급 요청을 위한 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RefreshReqeust {
	// 토큰 재발급에 사용할 리프레시 토큰
	private String refreshToken;
}
