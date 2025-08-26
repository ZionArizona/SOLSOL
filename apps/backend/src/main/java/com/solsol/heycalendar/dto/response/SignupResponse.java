package com.solsol.heycalendar.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "회원가입 성공 응답 정보")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupResponse {
    @Schema(description = "학번 (사용자 고유 번호)", example = "20240001")
    private String userNm;
    
    @Schema(description = "사용자 ID (이메일)", example = "test@ssafy.co.kr")
    private String userId;
    
    @Schema(description = "사용자 실명", example = "홍길동")
    private String userName;
    
    @Schema(description = "신한은행 사용자키", example = "abc123def456")
    private String userKey;
    
    @Schema(description = "생성된 계좌번호", example = "1234567890123")
    private String accountNm;
}