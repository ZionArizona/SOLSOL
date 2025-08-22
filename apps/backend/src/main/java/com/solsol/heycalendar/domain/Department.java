package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Department Domain Entity
 * 
 * Represents a department within a college and university.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    /**
     * Department identifier (Primary Key)
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
     * Department display name
     */
    private String name;
}