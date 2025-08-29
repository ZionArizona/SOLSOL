package com.solsol.heycalendar.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private String userNm;
    private String userId;
    private String userName;
    private String accountNm;
    private Integer userMileage; // 마일리지 필드 추가
    private Integer grade;
    private BigDecimal gpa;
    private String role;
    private Long deptNm;
    private Long collegeNm;
    private Long univNm;
    // 추가 정보 (JOIN으로 가져올 수 있는)
    private String deptName;
    private String collegeName;
    private String univName;
}