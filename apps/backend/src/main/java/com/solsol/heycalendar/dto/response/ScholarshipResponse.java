package com.solsol.heycalendar.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장학금 상세 정보 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipResponse {
	@Schema(description = "장학금 ID")
	private Long scholarshipNm;
	
	@Schema(description = "장학금 제목", example = "성적우수 장학금")
	private String title;
	
	@Schema(description = "장학금 설명", example = "학업 성적이 우수한 학생에게 지급")
	private String description;
	
	@Schema(description = "신청 시작일", example = "2024-03-01")
	private LocalDate startDate;
	
	@Schema(description = "신청 마감일", example = "2024-03-31")
	private LocalDate endDate;
	
	@Schema(description = "생성자 ID")
	private Long createdBy;
	
	@Schema(description = "생성일시")
	private LocalDateTime createdAt;
	
	@Schema(description = "심사 기간 (일단위)", example = "7")
	private Integer reviewDuration;
	
	@Schema(description = "장학금 금액", example = "1000000")
	private BigDecimal amount;
	
	@Schema(description = "자격요건 목록")
	private List<EligibilityResponse> eligibilities;
	
	@Schema(description = "요구 서류 목록")
	private List<DocumentResponse> documents;
}