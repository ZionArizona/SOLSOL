package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipNotice {
    private Long id;
    private Long scholarshipId;
    private String title;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
}
