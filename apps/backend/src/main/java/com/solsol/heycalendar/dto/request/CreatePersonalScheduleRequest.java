package com.solsol.heycalendar.dto.request;

import lombok.Data;

@Data
public class CreatePersonalScheduleRequest {
    private String userNm;       // 12345 처럼 숫자가 와도 문자열로 바인딩됨
    private String date;         // "2025-08-18"
    private String scheduleName; // "ㅌㅇ2"
    private String startTime;    // "14:00"
    private String endTime;      // "15:00"
    private Integer notifyMinutes; // 10
}