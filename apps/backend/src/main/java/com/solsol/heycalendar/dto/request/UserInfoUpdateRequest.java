package com.solsol.heycalendar.dto.request;

import lombok.Data;

@Data
public class UserInfoUpdateRequest {
    private String userName;
    private Long deptNm;
    private Long collegeNm;
    private Long univNm;
    private Integer grade;
}