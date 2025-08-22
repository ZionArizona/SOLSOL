package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Mileage response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MileageResponse {
    
    private Long key;
    private String userNm;
    private Integer amount;
    private LocalDateTime createdAt;
    private String description;
}