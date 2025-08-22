package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * University Domain Entity
 * 
 * Represents a university with its basic information and relationships to colleges.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class University {
    /**
     * University identifier (Primary Key)
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
    
    /**
     * List of colleges belonging to this university
     * This is populated when fetching detailed university information
     */
    private List<College> colleges;
}