package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.College;
import com.solsol.heycalendar.domain.Department;
import com.solsol.heycalendar.domain.University;
import com.solsol.heycalendar.dto.request.CollegeRequest;
import com.solsol.heycalendar.dto.request.DepartmentRequest;
import com.solsol.heycalendar.dto.request.UniversityRequest;
import com.solsol.heycalendar.dto.response.CollegeResponse;
import com.solsol.heycalendar.dto.response.DepartmentResponse;
import com.solsol.heycalendar.dto.response.UniversityHierarchyResponse;
import com.solsol.heycalendar.dto.response.UniversityResponse;
import com.solsol.heycalendar.mapper.CollegeMapper;
import com.solsol.heycalendar.mapper.DepartmentMapper;
import com.solsol.heycalendar.mapper.UniversityMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * University Service
 * 
 * Handles business logic for university, college, and department management.
 * Provides hierarchical data management and cascade operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UniversityService {
    
    private final UniversityMapper universityMapper;
    private final CollegeMapper collegeMapper;
    private final DepartmentMapper departmentMapper;
    
    /**
     * Get all universities
     * 
     * @return List of university responses
     */
    public List<UniversityResponse> getAllUniversities() {
        log.debug("Fetching all universities");
        List<University> universities = universityMapper.findAll();
        return universities.stream()
                .map(this::convertToUniversityResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get university by ID
     * 
     * @param univNm University identifier
     * @return University response
     * @throws IllegalArgumentException if university not found
     */
    public UniversityResponse getUniversityById(String univNm) {
        log.debug("Fetching university with ID: {}", univNm);
        University university = findUniversityByIdOrThrow(univNm);
        return convertToUniversityResponse(university);
    }
    
    /**
     * Get university with complete hierarchy (colleges and departments)
     * 
     * @param univNm University identifier
     * @return University hierarchy response
     * @throws IllegalArgumentException if university not found
     */
    public UniversityHierarchyResponse getUniversityHierarchy(String univNm) {
        log.debug("Fetching university hierarchy for ID: {}", univNm);
        University university = findUniversityByIdOrThrow(univNm);
        List<College> colleges = collegeMapper.findByUniversityId(univNm);
        
        List<UniversityHierarchyResponse.CollegeWithDepartments> collegeResponses = 
            colleges.stream().map(college -> {
                List<Department> departments = departmentMapper.findByCollegeId(college.getCollegeNm(), univNm);
                List<DepartmentResponse> departmentResponses = departments.stream()
                        .map(this::convertToDepartmentResponse)
                        .collect(Collectors.toList());
                
                return UniversityHierarchyResponse.CollegeWithDepartments.builder()
                        .collegeNm(college.getCollegeNm())
                        .name(college.getName())
                        .departments(departmentResponses)
                        .build();
            }).collect(Collectors.toList());
        
        return UniversityHierarchyResponse.builder()
                .univNm(university.getUnivNm())
                .univName(university.getUnivName())
                .field2(university.getField2())
                .colleges(collegeResponses)
                .build();
    }
    
    /**
     * Create new university
     * 
     * @param request University creation request
     * @return Created university response
     * @throws IllegalArgumentException if university already exists
     */
    @Transactional
    public UniversityResponse createUniversity(UniversityRequest request) {
        log.info("Creating university with ID: {}", request.getUnivNm());
        
        if (universityMapper.existsById(request.getUnivNm())) {
            throw new IllegalArgumentException("University with ID '" + request.getUnivNm() + "' already exists");
        }
        
        University university = University.builder()
                .univNm(request.getUnivNm())
                .univName(request.getUnivName())
                .field2(request.getField2())
                .build();
        
        universityMapper.insert(university);
        log.info("Successfully created university: {}", request.getUnivNm());
        return convertToUniversityResponse(university);
    }
    
    /**
     * Update existing university
     * 
     * @param univNm University identifier
     * @param request University update request
     * @return Updated university response
     * @throws IllegalArgumentException if university not found
     */
    @Transactional
    public UniversityResponse updateUniversity(String univNm, UniversityRequest request) {
        log.info("Updating university with ID: {}", univNm);
        
        findUniversityByIdOrThrow(univNm);
        
        University university = University.builder()
                .univNm(univNm)
                .univName(request.getUnivName())
                .field2(request.getField2())
                .build();
        
        universityMapper.update(university);
        log.info("Successfully updated university: {}", univNm);
        return convertToUniversityResponse(university);
    }
    
    /**
     * Delete university with cascade
     * 
     * @param univNm University identifier
     * @throws IllegalArgumentException if university not found
     */
    @Transactional
    public void deleteUniversity(String univNm) {
        log.info("Deleting university with cascade: {}", univNm);
        
        findUniversityByIdOrThrow(univNm);
        
        // Cascade delete: departments -> colleges -> university
        departmentMapper.deleteByUniversityId(univNm);
        collegeMapper.deleteByUniversityId(univNm);
        universityMapper.deleteById(univNm);
        
        log.info("Successfully deleted university with cascade: {}", univNm);
    }
    
    /**
     * Get colleges by university
     * 
     * @param univNm University identifier
     * @return List of college responses
     * @throws IllegalArgumentException if university not found
     */
    public List<CollegeResponse> getCollegesByUniversity(String univNm) {
        log.debug("Fetching colleges for university: {}", univNm);
        
        findUniversityByIdOrThrow(univNm);
        List<College> colleges = collegeMapper.findByUniversityId(univNm);
        
        return colleges.stream()
                .map(this::convertToCollegeResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Create new college
     * 
     * @param univNm University identifier
     * @param request College creation request
     * @return Created college response
     * @throws IllegalArgumentException if university not found or college already exists
     */
    @Transactional
    public CollegeResponse createCollege(String univNm, CollegeRequest request) {
        log.info("Creating college {} for university: {}", request.getCollegeNm(), univNm);
        
        findUniversityByIdOrThrow(univNm);
        
        if (collegeMapper.existsById(request.getCollegeNm(), univNm)) {
            throw new IllegalArgumentException("College with ID '" + request.getCollegeNm() + "' already exists in university '" + univNm + "'");
        }
        
        College college = College.builder()
                .collegeNm(request.getCollegeNm())
                .univNm(univNm)
                .name(request.getName())
                .build();
        
        collegeMapper.insert(college);
        log.info("Successfully created college: {} in university: {}", request.getCollegeNm(), univNm);
        return convertToCollegeResponse(college);
    }
    
    /**
     * Get departments by college
     * 
     * @param univNm University identifier
     * @param collegeNm College identifier
     * @return List of department responses
     * @throws IllegalArgumentException if university or college not found
     */
    public List<DepartmentResponse> getDepartmentsByCollege(String univNm, String collegeNm) {
        log.debug("Fetching departments for college: {} in university: {}", collegeNm, univNm);
        
        findUniversityByIdOrThrow(univNm);
        findCollegeByIdOrThrow(collegeNm, univNm);
        
        List<Department> departments = departmentMapper.findByCollegeId(collegeNm, univNm);
        
        return departments.stream()
                .map(this::convertToDepartmentResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Create new department
     * 
     * @param univNm University identifier
     * @param collegeNm College identifier
     * @param request Department creation request
     * @return Created department response
     * @throws IllegalArgumentException if university/college not found or department already exists
     */
    @Transactional
    public DepartmentResponse createDepartment(String univNm, String collegeNm, DepartmentRequest request) {
        log.info("Creating department {} for college: {} in university: {}", request.getDeptNm(), collegeNm, univNm);
        
        findUniversityByIdOrThrow(univNm);
        findCollegeByIdOrThrow(collegeNm, univNm);
        
        if (departmentMapper.existsById(request.getDeptNm(), collegeNm, univNm)) {
            throw new IllegalArgumentException("Department with ID '" + request.getDeptNm() + "' already exists in college '" + collegeNm + "'");
        }
        
        Department department = Department.builder()
                .deptNm(request.getDeptNm())
                .collegeNm(collegeNm)
                .univNm(univNm)
                .name(request.getName())
                .build();
        
        departmentMapper.insert(department);
        log.info("Successfully created department: {} in college: {} in university: {}", request.getDeptNm(), collegeNm, univNm);
        return convertToDepartmentResponse(department);
    }
    
    // Helper methods
    
    private University findUniversityByIdOrThrow(String univNm) {
        University university = universityMapper.findById(univNm);
        if (university == null) {
            throw new IllegalArgumentException("University with ID '" + univNm + "' not found");
        }
        return university;
    }
    
    private College findCollegeByIdOrThrow(String collegeNm, String univNm) {
        College college = collegeMapper.findById(collegeNm, univNm);
        if (college == null) {
            throw new IllegalArgumentException("College with ID '" + collegeNm + "' not found in university '" + univNm + "'");
        }
        return college;
    }
    
    private UniversityResponse convertToUniversityResponse(University university) {
        return UniversityResponse.builder()
                .univNm(university.getUnivNm())
                .univName(university.getUnivName())
                .field2(university.getField2())
                .build();
    }
    
    private CollegeResponse convertToCollegeResponse(College college) {
        return CollegeResponse.builder()
                .collegeNm(college.getCollegeNm())
                .univNm(college.getUnivNm())
                .name(college.getName())
                .build();
    }
    
    private DepartmentResponse convertToDepartmentResponse(Department department) {
        return DepartmentResponse.builder()
                .deptNm(department.getDeptNm())
                .collegeNm(department.getCollegeNm())
                .univNm(department.getUnivNm())
                .name(department.getName())
                .build();
    }
}