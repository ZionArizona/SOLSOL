package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 제출서류 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
	private Long documentNm;
	private Long scholarshipNm;
	private String name;
	private String description;
}