package com.solsol.heycalendar.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class PersonalSchedule {
    private Long id;
    private String studentNo;         // User.userNm (학번) FK
    private LocalDate scheduleDate;   // YYYY-MM-DD
    private String scheduleName;
    private LocalTime startTime;      // HH:mm
    private LocalTime endTime;        // HH:mm
    private Integer notifyMinutes;    // 분
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
