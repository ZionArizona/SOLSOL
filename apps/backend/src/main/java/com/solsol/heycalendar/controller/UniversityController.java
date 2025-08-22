package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.dto.request.CollegeRequest;
import com.solsol.heycalendar.dto.request.DepartmentRequest;
import com.solsol.heycalendar.dto.request.UniversityRequest;
import com.solsol.heycalendar.dto.response.CollegeResponse;
import com.solsol.heycalendar.dto.response.DepartmentResponse;
import com.solsol.heycalendar.dto.response.UniversityHierarchyResponse;
import com.solsol.heycalendar.dto.response.UniversityResponse;
import com.solsol.heycalendar.service.UniversityService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * University Controller
 * 
 * REST API endpoints for university, college, and department management.
 */
@Slf4j
@RestController
@RequestMapping("/api/universities")
@RequiredArgsConstructor
@Validated
public class UniversityController {
    
    private final UniversityService universityService;
    
    /**
     * Get all universities
     * 
     * @return List of universities
     */
    @GetMapping
    public ResponseEntity<List<UniversityResponse>> getAllUniversities() {
        log.info("GET /api/universities - Fetching all universities");
        List<UniversityResponse> universities = universityService.getAllUniversities();
        return ResponseEntity.ok(universities);
    }
    
    /**
     * Get university by ID with complete hierarchy
     * 
     * @param univNm University identifier
     * @return University with colleges and departments
     */
    @GetMapping("/{univNm}")
    public ResponseEntity<UniversityHierarchyResponse> getUniversityById(
            @PathVariable @NotBlank String univNm) {
        log.info("GET /api/universities/{} - Fetching university with hierarchy", univNm);
        UniversityHierarchyResponse university = universityService.getUniversityHierarchy(univNm);
        return ResponseEntity.ok(university);
    }
    
    /**
     * Create new university
     * 
     * @param request University creation request
     * @return Created university
     */
    @PostMapping
    public ResponseEntity<UniversityResponse> createUniversity(
            @Valid @RequestBody UniversityRequest request) {
        log.info("POST /api/universities - Creating university: {}", request.getUnivNm());
        UniversityResponse university = universityService.createUniversity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(university);
    }
    
    /**
     * Update existing university
     * 
     * @param univNm University identifier
     * @param request University update request
     * @return Updated university
     */
    @PutMapping("/{univNm}")
    public ResponseEntity<UniversityResponse> updateUniversity(
            @PathVariable @NotBlank String univNm,
            @Valid @RequestBody UniversityRequest request) {
        log.info("PUT /api/universities/{} - Updating university", univNm);
        UniversityResponse university = universityService.updateUniversity(univNm, request);
        return ResponseEntity.ok(university);
    }
    
    /**
     * Delete university
     * 
     * @param univNm University identifier
     * @return No content response
     */
    @DeleteMapping("/{univNm}")
    public ResponseEntity<Void> deleteUniversity(
            @PathVariable @NotBlank String univNm) {
        log.info("DELETE /api/universities/{} - Deleting university", univNm);
        universityService.deleteUniversity(univNm);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get colleges by university
     * 
     * @param univNm University identifier
     * @return List of colleges in the university
     */
    @GetMapping("/{univNm}/colleges")
    public ResponseEntity<List<CollegeResponse>> getCollegesByUniversity(
            @PathVariable @NotBlank String univNm) {
        log.info("GET /api/universities/{}/colleges - Fetching colleges", univNm);
        List<CollegeResponse> colleges = universityService.getCollegesByUniversity(univNm);
        return ResponseEntity.ok(colleges);
    }
    
    /**
     * Create new college in university
     * 
     * @param univNm University identifier
     * @param request College creation request
     * @return Created college
     */
    @PostMapping("/{univNm}/colleges")
    public ResponseEntity<CollegeResponse> createCollege(
            @PathVariable @NotBlank String univNm,
            @Valid @RequestBody CollegeRequest request) {
        log.info("POST /api/universities/{}/colleges - Creating college: {}", univNm, request.getCollegeNm());
        CollegeResponse college = universityService.createCollege(univNm, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(college);
    }
    
    /**
     * Get departments by college
     * 
     * @param univNm University identifier
     * @param collegeNm College identifier
     * @return List of departments in the college
     */
    @GetMapping("/{univNm}/colleges/{collegeNm}/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByCollege(
            @PathVariable @NotBlank String univNm,
            @PathVariable @NotBlank String collegeNm) {
        log.info("GET /api/universities/{}/colleges/{}/departments - Fetching departments", univNm, collegeNm);
        List<DepartmentResponse> departments = universityService.getDepartmentsByCollege(univNm, collegeNm);
        return ResponseEntity.ok(departments);
    }
    
    /**
     * Create new department in college
     * 
     * @param univNm University identifier
     * @param collegeNm College identifier
     * @param request Department creation request
     * @return Created department
     */
    @PostMapping("/{univNm}/colleges/{collegeNm}/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @PathVariable @NotBlank String univNm,
            @PathVariable @NotBlank String collegeNm,
            @Valid @RequestBody DepartmentRequest request) {
        log.info("POST /api/universities/{}/colleges/{}/departments - Creating department: {}", 
                 univNm, collegeNm, request.getDeptNm());
        DepartmentResponse department = universityService.createDepartment(univNm, collegeNm, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(department);
    }
    
    /**
     * Global exception handler for IllegalArgumentException
     * 
     * @param ex The exception
     * @return Error response
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid request: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("INVALID_REQUEST", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
    
    /**
     * Global exception handler for general exceptions
     * 
     * @param ex The exception
     * @return Error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Error response DTO
     */
    public static class ErrorResponse {
        private String code;
        private String message;
        
        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }
        
        public String getCode() {
            return code;
        }
        
        public String getMessage() {
            return message;
        }
    }
}