package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper Interface for Department operations
 */
@Mapper
public interface DepartmentMapper {
    
    /**
     * Find all departments by college
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return List of departments in the college
     */
    List<Department> findByCollegeId(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Find all departments by university
     * 
     * @param univNm University identifier
     * @return List of departments in the university
     */
    List<Department> findByUniversityId(@Param("univNm") String univNm);
    
    /**
     * Find department by ID
     * 
     * @param deptNm Department identifier
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return Department if found, null otherwise
     */
    Department findById(@Param("deptNm") String deptNm, @Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Insert new department
     * 
     * @param department Department to insert
     * @return Number of affected rows
     */
    int insert(Department department);
    
    /**
     * Update existing department
     * 
     * @param department Department to update
     * @return Number of affected rows
     */
    int update(Department department);
    
    /**
     * Delete department by ID
     * 
     * @param deptNm Department identifier
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteById(@Param("deptNm") String deptNm, @Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Delete all departments by college
     * 
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteByCollegeId(@Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
    
    /**
     * Delete all departments by university
     * 
     * @param univNm University identifier
     * @return Number of affected rows
     */
    int deleteByUniversityId(@Param("univNm") String univNm);
    
    /**
     * Check if department exists
     * 
     * @param deptNm Department identifier
     * @param collegeNm College identifier
     * @param univNm University identifier
     * @return true if exists, false otherwise
     */
    boolean existsById(@Param("deptNm") String deptNm, @Param("collegeNm") String collegeNm, @Param("univNm") String univNm);
}