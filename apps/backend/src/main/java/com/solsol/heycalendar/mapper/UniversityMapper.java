package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.University;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper Interface for University operations
 */
@Mapper
public interface UniversityMapper {
    
    /**
     * Find all universities
     * 
     * @return List of all universities
     */
    List<University> findAll();
    
    /**
     * Find university by ID
     * 
     * @param univNm University identifier
     * @return University if found, null otherwise
     */
    University findById(@Param("univNm") String univNm);
    
    /**
     * Find university with colleges and departments
     * 
     * @param univNm University identifier
     * @return University with complete hierarchy
     */
    University findByIdWithHierarchy(@Param("univNm") String univNm);
    
    /**
     * Insert new university
     * 
     * @param university University to insert
     * @return Number of affected rows
     */
    int insert(University university);
    
    /**
     * Update existing university
     * 
     * @param university University to update
     * @return Number of affected rows
     */
    int update(University university);
    
    /**
     * Delete university by ID
     * 
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteById(@Param("univNm") String univNm);
    
    /**
     * Check if university exists
     * 
     * @param univNm University identifier
     * @return true if exists, false otherwise
     */
    boolean existsById(@Param("univNm") String univNm);
}