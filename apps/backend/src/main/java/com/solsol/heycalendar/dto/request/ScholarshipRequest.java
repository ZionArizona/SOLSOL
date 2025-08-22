package com.solsol.heycalendar.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장학금 생성/수정 요청을 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipRequest {
	@NotBlank(message = "제목은 필수입니다")
	private String title;
	
	@NotBlank(message = "설명은 필수입니다")
	private String description;
	
	@NotNull(message = "시작일은 필수입니다")
	private LocalDate startDate;
	
	@NotNull(message = "종료일은 필수입니다")
	private LocalDate endDate;
	
	@Positive(message = "심사 기간은 양수여야 합니다")
	private Integer reviewDuration;
	
	@NotNull(message = "장학금 금액은 필수입니다")
	@Positive(message = "장학금 금액은 양수여야 합니다")
	private BigDecimal amount;
}