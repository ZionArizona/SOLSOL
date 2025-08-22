package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * University Response DTO
 * 
 * Used for returning university information in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityResponse {
    /**
     * University identifier
     */
    private String univNm;
    
    /**
     * University display name
     */
    private String univName;
    
    /**
     * Additional field for university data
     */
    private Double field2;
}