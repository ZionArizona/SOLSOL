package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;
import com.solsol.heycalendar.entity.ApplicationState;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Application {
    private String userNm;
    private Long scholarshipNm;
    private ApplicationState state;
    private LocalDateTime appliedAt;
    private String reason;
}