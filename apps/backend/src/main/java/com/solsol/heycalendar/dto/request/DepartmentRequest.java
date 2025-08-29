package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * department Request DTO
 * 
 * Used for creating and updating department information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {
    /**
     * department identifier
     * Required for creation, used as primary key
     */
    @NotBlank(message = "department ID cannot be blank")
    @Size(max = 50, message = "=department ID cannot exceed 50 characters")
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
     * department display name
     */
    @NotBlank(message = "department name cannot be blank")
    @Size(max = 200, message = "department name cannot exceed 200 characters")
    private String name;
}
