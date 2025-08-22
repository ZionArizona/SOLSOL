package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 요청을 위한 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
	private String userId;
	private String password;
}
