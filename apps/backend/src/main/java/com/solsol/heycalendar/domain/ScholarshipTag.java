package com.solsol.heycalendar.domain;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipTag {
    private Long id;
    private Long scholarshipId; // FK
    private String tag;
}
