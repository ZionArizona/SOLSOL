package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 대학/단과대/학과 이름 매핑 결과 DTO.
 * null 가능: 특정 ID가 없거나 매칭 실패 시 이름은 채우지 않을 수 있다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationNamesResponse {
	private String universityName;
	private String collegeName;
	private String departmentName;
}
