package com.solsol.heycalendar.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 상세 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipResponse {
	private Long scholarshipNm;
	private String title;
	private String description;
	private LocalDate startDate;
	private LocalDate endDate;
	private Long createdBy;
	private LocalDateTime createdAt;
	private Integer reviewDuration;
	private BigDecimal amount;
	private List<EligibilityResponse> eligibilities;
	private List<DocumentResponse> documents;
}