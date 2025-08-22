package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * University Hierarchy Response DTO
 * 
 * Used for returning complete university information with colleges and departments.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityHierarchyResponse {
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
    
    /**
     * List of colleges with their departments
     */
    private List<CollegeWithDepartments> colleges;
    
    /**
     * Nested DTO for college with its departments
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeWithDepartments {
        /**
         * College identifier
         */
        private String collegeNm;
        
        /**
         * College display name
         */
        private String name;
        
        /**
         * List of departments in this college
         */
        private List<DepartmentResponse> departments;
    }
}