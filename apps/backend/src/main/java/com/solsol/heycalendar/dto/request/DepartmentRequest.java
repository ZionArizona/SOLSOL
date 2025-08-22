package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Department Request DTO
 * 
 * Used for creating and updating department information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {
    /**
     * Department identifier
     * Required for creation, used as primary key
     */
    @NotBlank(message = "Department ID cannot be blank")
    @Size(max = 50, message = "Department ID cannot exceed 50 characters")
    private String deptNm;
    
    /**
     * College identifier (Foreign Key)
     * This is typically provided via path parameter in REST endpoints
     */
    private String collegeNm;
    
    /**
     * University identifier (Foreign Key)
     * This is typically provided via path parameter in REST endpoints
     */
    private String univNm;
    
    /**
     * Department display name
     */
    @NotBlank(message = "Department name cannot be blank")
    @Size(max = 200, message = "Department name cannot exceed 200 characters")
    private String name;
}