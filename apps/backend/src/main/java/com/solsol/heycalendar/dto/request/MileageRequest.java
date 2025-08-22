package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Mileage request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MileageRequest {
    
    @NotBlank(message = "User name is required")
    private String userNm;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Integer amount;
    
    private String description;
}