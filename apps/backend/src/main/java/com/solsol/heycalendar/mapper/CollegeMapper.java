package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.College;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper Interface for College operations
 */
@Mapper
public interface CollegeMapper {
    
    /**
     * Find all colleges by university
     * 
     * @param univNm University identifier
     * @return List of colleges in the university
     */
    List<College> findByUniversityId(@Param("univNm") String univNm);
    
    /**
     * Find college by ID
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return College if found, null otherwise
     */
    College findById(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Find college with departments
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return College with departments
     */
    College findByIdWithDepartments(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Insert new college
     * 
     * @param college College to insert
     * @return Number of affected rows
     */
    int insert(College college);
    
    /**
     * Update existing college
     * 
     * @param college College to update
     * @return Number of affected rows
     */
    int update(College college);
    
    /**
     * Delete college by ID
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteById(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Delete all colleges by university
     * 
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteByUniversityId(@Param("univNm") String univNm);
    
    /**
     * Check if college exists
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return true if exists, false otherwise
     */
    boolean existsById(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
}