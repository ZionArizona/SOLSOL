package com.solsol.heycalendar.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalScheduleResponse {
    private Long id;
    private String studentNo;                      // = userNm

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduleDate;

    private String scheduleName;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private Integer notifyMinutes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
