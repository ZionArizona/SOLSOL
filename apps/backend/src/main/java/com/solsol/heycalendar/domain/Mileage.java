package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Mileage domain entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mileage {
    
    private Long key;
    private String userNm;
    private Integer amount;
    private Long scholarshipNm;
    private LocalDateTime createdAt;
    private String reason;
    private String description;
}