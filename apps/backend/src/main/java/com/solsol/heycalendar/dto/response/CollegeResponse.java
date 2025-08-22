package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * College Response DTO
 * 
 * Used for returning college information in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeResponse {
    /**
     * College identifier
     */
    private String collegeNm;
    
    /**
     * University identifier
     */
    private String univNm;
    
    /**
     * College display name
     */
    private String name;
}