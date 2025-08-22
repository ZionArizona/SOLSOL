package com.solsol.heycalendar.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scholarship {
	private Long scholarshipNm;
	private String title;
	private String description;
	private LocalDate startDate;
	private LocalDate endDate;
	private Long createdBy;
	private LocalDateTime createdAt;
	private Integer reviewDuration;
	private BigDecimal amount;
}