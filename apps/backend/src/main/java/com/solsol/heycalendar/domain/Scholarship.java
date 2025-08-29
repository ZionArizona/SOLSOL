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
	// PK
	private Long id;

	// 기본 정보
	private String scholarshipName;                 // 장학금명 *
	private String description;                     // 상세 설명
	private ScholarshipType type;                   // ACADEMIC / FINANCIAL_AID / ACTIVITY / OTHER
	private Integer amount;                         // 지급 금액(원) *
	private Integer numberOfRecipients;             // 선발 인원 *
	private PaymentMethod paymentMethod;            // LUMP_SUM / INSTALLMENT

	// 모집/심사/일정
	private LocalDate recruitmentStartDate;         // 모집 시작일
	private LocalDate recruitmentEndDate;           // 모집 종료일 *
	private LocalDate evaluationStartDate;          // 심사 시작일 *
	private LocalDate interviewDate;                // 면접 예정일
	private LocalDate resultAnnouncementDate;       // 결과 발표일 *
	private EvaluationMethod evaluationMethod;      // DOCUMENT_REVIEW / DOCUMENT_INTERVIEW
	private RecruitmentStatus recruitmentStatus;    // DRAFT / OPEN / CLOSED

	// 신청 제한/자격
	private String eligibilityCondition;            // 지원 자격 조건 *
	private String gradeRestriction;                // 예: 1학년 이상, 4학년만
	private String majorRestriction;                // 예: 컴퓨터공학과
	private Boolean duplicateAllowed;               // 중복 수혜 가능 여부
	private BigDecimal minGpa;                      // 최소 학점(예: 3.00)

	// 카테고리/태그
	private String category;                        // 단일 카테고리(선택/입력)

	// 문의처
	private String contactPersonName;               // 담당자명 *
	private String contactPhone;                    // 연락처 *
	private String contactEmail;                    // 이메일 *
	private String officeLocation;                  // 사무실 위치
	private String consultationHours;               // 상담 가능 시간(문자열)

	// 제출서류 (JSON 배열로 저장)
	private String requiredDocuments;               // JSON array string

	// 메타
	private String createdBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}