package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Department Response DTO
 * 
 * Used for returning department information in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    /**
     * Department identifier
     */
    private String deptNm;
    
    /**
     * College identifier
     */
    private String collegeNm;
    
    /**
     * University identifier
     */
    private String univNm;
    
    /**
     * Department display name
     */
    private String name;
}