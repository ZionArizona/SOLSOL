package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for scholarship application submission
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {
    
    @NotBlank(message = "User name is required")
    @Size(max = 100, message = "User name must not exceed 100 characters")
    private String userNm;
    
    @NotBlank(message = "Scholarship name is required")
    @Size(max = 100, message = "Scholarship name must not exceed 100 characters")
    private String scholarshipNm;
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason; // Optional initial reason or motivation
}