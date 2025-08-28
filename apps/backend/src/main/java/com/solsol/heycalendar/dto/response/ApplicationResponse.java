package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.entity.ApplicationState;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for application list and basic application information
 */
@Schema(description = "장학금 신청 응답")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    
    @Schema(description = "신청자명", example = "홍길동")
    private String userNm;
    
    @Schema(description = "장학금 ID", example = "1")
    private Long scholarshipNm;
    
    @Schema(description = "장학금명", example = "성적우수장학금")
    private String scholarshipName;
    
    @Schema(description = "신청 상태", example = "PENDING")
    private ApplicationState state;
    
    @Schema(description = "신청일시", example = "2024-01-01T10:00:00")
    private LocalDateTime appliedAt;
    
    @Schema(description = "신청 사유", example = "학업 성취도가 우수함")
    private String reason;
    
    @Schema(description = "사용자 이름", example = "홍길동")
    private String userName;
    
    @Schema(description = "신청 날짜", example = "2024-01-01T10:00:00")
    private LocalDateTime applicationDate;
    
    @Schema(description = "신청 상태", example = "PENDING")
    private ApplicationState applicationState;
    
    // User information fields
    @Schema(description = "학과명", example = "컴퓨터공학과")
    private String departmentName;
    
    @Schema(description = "단과대명", example = "공과대학")
    private String collegeName;
    
    @Schema(description = "대학명", example = "삼성대학교")
    private String universityName;
}