package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * department Domain Entity
 * 
 * Represents a department within a college and university.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    /**
     * department identifier (Primary Key)
     */
    private String deptNm;
    
    /**
     * College identifier (Foreign Key)
     */
    private String collegeNm;
    
    /**
     * University identifier (Foreign Key)
     */
    private String univNm;
    
    /**
     * department display name
     */
    private String name;
}
