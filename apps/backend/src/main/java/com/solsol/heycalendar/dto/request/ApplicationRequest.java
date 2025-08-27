package com.solsol.heycalendar.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "장학금 신청 요청 정보")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {
    
    @Schema(description = "신청할 장학금 ID", example = "1")
    @NotNull(message = "Scholarship ID is required")
    private Long scholarshipId;
    
    @Schema(description = "신청 사유 (선택사항)", example = "학업에 열심히 임해 좋은 성적을 얻었습니다")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}