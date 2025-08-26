package com.solsol.heycalendar.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장학금 등록/수정 요청 정보")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipRequest {
	@Schema(description = "장학금 제목", example = "성적우수 장학금")
	@NotBlank(message = "제목은 필수입니다")
	private String title;
	
	@Schema(description = "장학금 상세 설명", example = "학업 성적이 우수한 학생에게 지급하는 장학금")
	@NotBlank(message = "설명은 필수입니다")
	private String description;
	
	@Schema(description = "장학금 신청 시작일", example = "2024-03-01")
	@NotNull(message = "시작일은 필수입니다")
	private LocalDate startDate;
	
	@Schema(description = "장학금 신청 마감일", example = "2024-03-31")
	@NotNull(message = "종료일은 필수입니다")
	private LocalDate endDate;
	
	@Schema(description = "심사 기간 (일단위)", example = "7")
	@Positive(message = "심사 기간은 양수여야 합니다")
	private Integer reviewDuration;
	
	@Schema(description = "장학금 지급 금액", example = "1000000")
	@NotNull(message = "장학금 금액은 필수입니다")
	@Positive(message = "장학금 금액은 양수여야 합니다")
	private BigDecimal amount;
}