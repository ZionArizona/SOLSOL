package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Eligibility {
	private Long eligibilityNm;
	private Long scholarshipNm;
	private EligibilityField field;
	private EligibilityOperator operator;
	private String value;
	private String content;
}