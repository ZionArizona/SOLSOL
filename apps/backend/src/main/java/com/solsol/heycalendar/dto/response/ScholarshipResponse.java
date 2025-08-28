package com.solsol.heycalendar.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.solsol.heycalendar.domain.*;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "장학금 상세 응답")
@Getter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ScholarshipResponse {

	private Long id;

	// 기본
	private String scholarshipName;
	private String description;
	private ScholarshipType type;
	private Integer amount;
	private Integer numberOfRecipients;
	private PaymentMethod paymentMethod;

	// 일정/심사
	private LocalDate recruitmentStartDate;
	private LocalDate recruitmentEndDate;
	private LocalDate evaluationStartDate;
	private LocalDate interviewDate;
	private LocalDate resultAnnouncementDate;
	private EvaluationMethod evaluationMethod;
	private RecruitmentStatus recruitmentStatus;

	// 제한
	private String eligibilityCondition;
	private String gradeRestriction;
	private String majorRestriction;
	private Boolean duplicateAllowed;
	private BigDecimal minGpa;

	// 카테고리/태그
	private String category;
	private List<String> tags;

	// 문의처
	private String contactPersonName;
	private String contactPhone;
	private String contactEmail;
	private String officeLocation;
	private String consultationHours;

	// 공지
	private ScholarshipNoticeDto notice;

	// 평가기준
	private List<CriteriaDto> criteria;

	// 필수 제출서류
	private List<RequiredDocumentDto> requiredDocuments;

	// 메타
	private String createdBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@Getter @Builder @NoArgsConstructor @AllArgsConstructor
	public static class RequiredDocumentDto {
		private String name;
		private List<String> keywords;
		private Boolean required;
	}

	@Getter @Builder @NoArgsConstructor @AllArgsConstructor
	public static class CriteriaDto {
		private Long id;
		private String name;
		private Double stdPoint;
		private Integer weightPercent;
	}

	@Getter @Builder @NoArgsConstructor @AllArgsConstructor
	public static class ScholarshipNoticeDto {
		private Long id;
		private String title;
		private String content;
		private String imageUrl;
		private LocalDateTime createdAt;
	}
}
