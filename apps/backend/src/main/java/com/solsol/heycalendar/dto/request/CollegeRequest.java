package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * College Request DTO
 * 
 * Used for creating and updating college information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeRequest {
    /**
     * College identifier
     * Required for creation, used as primary key
     */
    @NotBlank(message = "College ID cannot be blank")
    @Size(max = 50, message = "College ID cannot exceed 50 characters")
    private String collegeNm;
    
    /**
     * University identifier (Foreign Key)
     * This is typically provided via path parameter in REST endpoints
     */
    private String univNm;
    
    /**
     * College display name
     */
    @NotBlank(message = "College name cannot be blank")
    @Size(max = 200, message = "College name cannot exceed 200 characters")
    private String name;
}