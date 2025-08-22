package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * University Request DTO
 * 
 * Used for creating and updating university information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityRequest {
    /**
     * University identifier
     * Required for creation, used as primary key
     */
    @NotBlank(message = "University ID cannot be blank")
    @Size(max = 50, message = "University ID cannot exceed 50 characters")
    private String univNm;
    
    /**
     * University display name
     */
    @NotBlank(message = "University name cannot be blank")
    @Size(max = 200, message = "University name cannot exceed 200 characters")
    private String univName;
    
    /**
     * Additional field for university data
     */
    private Double field2;
}