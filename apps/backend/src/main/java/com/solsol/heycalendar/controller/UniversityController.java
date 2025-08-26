package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.dto.request.CollegeRequest;
import com.solsol.heycalendar.dto.request.DepartmentRequest;
import com.solsol.heycalendar.dto.request.UniversityRequest;
import com.solsol.heycalendar.dto.response.CollegeResponse;
import com.solsol.heycalendar.dto.response.DepartmentResponse;
import com.solsol.heycalendar.dto.response.UniversityHierarchyResponse;
import com.solsol.heycalendar.dto.response.UniversityResponse;
import com.solsol.heycalendar.service.UniversityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Tag(name = "대학 관리", description = "대학, 단과대, 학과 정보 관리 API")
@Slf4j
@RestController
@RequestMapping("/api/universities")
@RequiredArgsConstructor
@Validated
public class UniversityController {
    
    private final UniversityService universityService;
    
    @Operation(summary = "대학 전체 목록 조회", description = "등록된 모든 대학 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<UniversityResponse>> getAllUniversities() {
        log.info("GET /api/universities - Fetching all universities");
        List<UniversityResponse> universities = universityService.getAllUniversities();
        return ResponseEntity.ok(universities);
    }
    
    @Operation(summary = "대학 상세 정보 조회", description = "특정 대학의 단과대 및 학과 정보를 포함한 상세 정보를 조회합니다.")
    @GetMapping("/{univNm}")
    public ResponseEntity<UniversityHierarchyResponse> getUniversityById(
            @PathVariable @NotBlank String univNm) {
        log.info("GET /api/universities/{} - Fetching university with hierarchy", univNm);
        UniversityHierarchyResponse university = universityService.getUniversityHierarchy(univNm);
        return ResponseEntity.ok(university);
    }
    
    @Operation(summary = "대학 새로 등록", description = "새로운 대학 정보를 등록합니다.")
    @PostMapping
    public ResponseEntity<UniversityResponse> createUniversity(
            @Valid @RequestBody UniversityRequest request) {
        log.info("POST /api/universities - Creating university: {}", request.getUnivNm());
        UniversityResponse university = universityService.createUniversity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(university);
    }
    
    @Operation(summary = "대학 정보 수정", description = "기존 대학의 정보를 수정합니다.")
    @PutMapping("/{univNm}")
    public ResponseEntity<UniversityResponse> updateUniversity(
            @PathVariable @NotBlank String univNm,
            @Valid @RequestBody UniversityRequest request) {
        log.info("PUT /api/universities/{} - Updating university", univNm);
        UniversityResponse university = universityService.updateUniversity(univNm, request);
        return ResponseEntity.ok(university);
    }
    
    @Operation(summary = "대학 삭제", description = "등록된 대학을 삭제합니다.")
    @DeleteMapping("/{univNm}")
    public ResponseEntity<Void> deleteUniversity(
            @PathVariable @NotBlank String univNm) {
        log.info("DELETE /api/universities/{} - Deleting university", univNm);
        universityService.deleteUniversity(univNm);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "대학의 단과대 목록 조회", description = "특정 대학에 속한 모든 단과대 목록을 조회합니다.")
    @GetMapping("/{univNm}/colleges")
    public ResponseEntity<List<CollegeResponse>> getCollegesByUniversity(
            @PathVariable @NotBlank String univNm) {
        log.info("GET /api/universities/{}/colleges - Fetching colleges", univNm);
        List<CollegeResponse> colleges = universityService.getCollegesByUniversity(univNm);
        return ResponseEntity.ok(colleges);
    }
    
    @Operation(summary = "단과대 등록", description = "특정 대학에 새로운 단과대를 등록합니다.")
    @PostMapping("/{univNm}/colleges")
    public ResponseEntity<CollegeResponse> createCollege(
            @PathVariable @NotBlank String univNm,
            @Valid @RequestBody CollegeRequest request) {
        log.info("POST /api/universities/{}/colleges - Creating college: {}", univNm, request.getCollegeNm());
        CollegeResponse college = universityService.createCollege(univNm, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(college);
    }
    
    @Operation(summary = "단과대의 학과 목록 조회", description = "특정 단과대에 속한 모든 학과 목록을 조회합니다.")
    @GetMapping("/{univNm}/colleges/{collegeNm}/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByCollege(
            @PathVariable @NotBlank String univNm,
            @PathVariable @NotBlank String collegeNm) {
        log.info("GET /api/universities/{}/colleges/{}/departments - Fetching departments", univNm, collegeNm);
        List<DepartmentResponse> departments = universityService.getDepartmentsByCollege(univNm, collegeNm);
        return ResponseEntity.ok(departments);
    }
    
    @Operation(summary = "학과 등록", description = "특정 단과대에 새로운 학과를 등록합니다.")
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