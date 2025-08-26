package com.solsol.heycalendar.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 요청")
public class SignupRequest {
    @Schema(description = "사용자 이름", example = "홍길동", required = true)
    private String userName;
    
    @Schema(description = "이메일 (사용자 ID)", example = "test@ssafy.co.kr", required = true)
    private String userId;
    
    @Schema(description = "비밀번호", example = "password123", required = true)
    private String password;
    
    @Schema(description = "대학교 선택", example = "1", required = true, 
            allowableValues = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"})
    private Long univNm;
    
    @Schema(description = "학과 선택 (대학교에 따라 변경)", example = "1", required = true)
    private Long deptNm;
    
    @Schema(description = "학번", example = "20240001", required = true)
    private String userNm;
    
    @Schema(description = "계좌생성 동의", example = "true", required = true)
    private boolean accountCreationConsent;
    
    // 자동 계산되는 필드들
    @Schema(hidden = true)
    private Long collegeNm; // 대학에 따라 자동 설정
    
    @Schema(hidden = true)
    private int grade = 1; // 기본값 1학년
}