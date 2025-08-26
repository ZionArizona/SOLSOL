package com.solsol.heycalendar.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "로그인 요청 정보")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
	@Schema(description = "사용자 ID", example = "user123")
	private String userId;
	
	@Schema(description = "비밀번호", example = "password123")
	private String password;
}
