package com.solsol.heycalendar.dto.response;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class PersonalScheduleListResponse {
    private String userNm;
    private int count;
    private List<PersonalScheduleResponse> schedules;
}