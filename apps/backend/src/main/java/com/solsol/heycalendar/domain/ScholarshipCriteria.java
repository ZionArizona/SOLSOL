package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipCriteria {
    private Long id;
    private Long scholarshipId;     // FK -> scholarship.id
    private String name;            // 항목명 (예: 성적증명서)
    private Double stdPoint;        // 기준 점수 (nullable)
    private Integer weightPercent;  // 가중치(0~100)
    private LocalDateTime createdAt;
}
