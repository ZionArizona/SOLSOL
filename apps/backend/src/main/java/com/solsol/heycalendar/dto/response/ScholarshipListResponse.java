package com.solsol.heycalendar.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 목록 조회 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipListResponse {
	private Long scholarshipNm;
	private String title;
	private String description;
	private LocalDate startDate;
	private LocalDate endDate;
	private LocalDateTime createdAt;
	private BigDecimal amount;
}