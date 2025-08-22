package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * College Domain Entity
 * 
 * Represents a college within a university with its departments.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class College {
    /**
     * College identifier (Primary Key)
     */
    private String collegeNm;
    
    /**
     * University identifier (Foreign Key)
     */
    private String univNm;
    
    /**
     * College display name
     */
    private String name;
    
    /**
     * List of departments belonging to this college
     * This is populated when fetching detailed college information
     */
    private List<Department> departments;
}