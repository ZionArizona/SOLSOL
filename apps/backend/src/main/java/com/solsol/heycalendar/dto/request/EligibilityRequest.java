package com.solsol.heycalendar.dto.request;

import com.solsol.heycalendar.domain.EligibilityField;
import com.solsol.heycalendar.domain.EligibilityOperator;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 자격요건 생성/수정 요청을 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityRequest {
	@NotNull(message = "자격요건 필드는 필수입니다")
	private EligibilityField field;
	
	@NotNull(message = "연산자는 필수입니다")
	private EligibilityOperator operator;
	
	@NotBlank(message = "값은 필수입니다")
	private String value;
	
	private String content;
}