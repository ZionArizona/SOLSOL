package com.solsol.heycalendar.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.solsol.heycalendar.domain.EvaluationMethod;
import com.solsol.heycalendar.domain.PaymentMethod;
import com.solsol.heycalendar.domain.RecruitmentStatus;
import com.solsol.heycalendar.domain.ScholarshipType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Schema(description = "장학금 등록/수정 요청")
@Getter @Setter
@Builder @NoArgsConstructor @AllArgsConstructor
public class ScholarshipRequest {

	// 기본 정보
	@NotBlank private String scholarshipName;
	@NotNull  private ScholarshipType type;                  // ACADEMIC/FINANCIAL_AID/ACTIVITY/OTHER
	@NotNull @Positive private Integer amount;              // 원화 정수
	@NotNull @Positive private Integer numberOfRecipients;
	@NotNull  private PaymentMethod paymentMethod;          // LUMP_SUM/INSTALLMENT
	private String description;

	// 모집/심사/일정
	private LocalDate recruitmentStartDate;                 // nullable
	@NotNull private LocalDate recruitmentEndDate;
	@NotNull private LocalDate evaluationStartDate;
	private LocalDate interviewDate;
	@NotNull private LocalDate resultAnnouncementDate;
	@NotNull private EvaluationMethod evaluationMethod;    // DOCUMENT_REVIEW/DOCUMENT_INTERVIEW
	private RecruitmentStatus recruitmentStatus = RecruitmentStatus.OPEN;

	// 자격/제한
	@NotBlank private String eligibilityCondition;
	private String gradeRestriction;
	private String majorRestriction;
	@NotNull private Boolean duplicateAllowed;
	private BigDecimal minGpa;                              // 예: 3.00

	// 카테고리/태그
	private String category;
	private List<String> tags;

	// 문의처
	@NotBlank private String contactPersonName;
	@NotBlank private String contactPhone;
	@Email @NotBlank private String contactEmail;
	private String officeLocation;
	private String consultationHours;

	// 공지
	private String noticeTitle;
	private String noticeContent;
	private String noticeImageUrl;

	// 제출 서류/평가기준(동적 리스트)
	private List<CriteriaItem> criteria;                   // name/std/weight

	@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
	public static class CriteriaItem {
		@NotBlank private String name;
		private Double std;                                // 기준점수 nullable
		@NotNull @Min(0) @Max(100) private Integer weight; // 0~100
	}
}
