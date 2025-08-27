package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipBookmark {
    private Long id;
    private String userNm;
    private Long scholarshipId;
    private LocalDateTime createdAt;
}