package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.domain.EligibilityField;
import com.solsol.heycalendar.domain.EligibilityOperator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 자격요건 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityResponse {
	private Long eligibilityNm;
	private Long scholarshipNm;
	private EligibilityField field;
	private EligibilityOperator operator;
	private String value;
	private String content;
}