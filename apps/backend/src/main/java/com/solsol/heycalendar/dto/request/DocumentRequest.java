package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 제출서류 생성/수정 요청을 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequest {
	@NotBlank(message = "서류명은 필수입니다")
	private String name;
	
	private String description;
}