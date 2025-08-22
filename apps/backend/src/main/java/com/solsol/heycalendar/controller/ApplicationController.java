package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.dto.request.ApplicationDocumentRequest;
import com.solsol.heycalendar.dto.request.ApplicationRequest;
import com.solsol.heycalendar.dto.request.ApplicationReviewRequest;
import com.solsol.heycalendar.dto.response.ApplicationDetailResponse;
import com.solsol.heycalendar.dto.response.ApplicationDocumentResponse;
import com.solsol.heycalendar.dto.response.ApplicationResponse;
import com.solsol.heycalendar.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for scholarship application management
 */
@Slf4j
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Validated
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Get all applications
     * @return List of all applications
     */
    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        log.info("Fetching all applications");
        List<ApplicationResponse> applications = applicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    /**
     * Get applications by user
     * @param userNm User name
     * @return List of user's applications
     */
    @GetMapping("/user/{userNm}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByUser(
            @PathVariable String userNm) {
        log.info("Fetching applications for user: {}", userNm);
        List<ApplicationResponse> applications = applicationService.getApplicationsByUser(userNm);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get applications by scholarship
     * @param scholarshipNm Scholarship name
     * @return List of scholarship's applications
     */
    @GetMapping("/scholarship/{scholarshipNm}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByScholarship(
            @PathVariable String scholarshipNm) {
        log.info("Fetching applications for scholarship: {}", scholarshipNm);
        List<ApplicationResponse> applications = applicationService.getApplicationsByScholarship(scholarshipNm);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get detailed application information
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Detailed application information
     */
    @GetMapping("/{userNm}/{scholarshipNm}")
    public ResponseEntity<ApplicationDetailResponse> getApplicationDetail(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm) {
        log.info("Fetching application detail for user: {} and scholarship: {}", userNm, scholarshipNm);
        ApplicationDetailResponse application = applicationService.getApplicationDetail(userNm, scholarshipNm);
        return ResponseEntity.ok(application);
    }

    /**
     * Submit a new application
     * @param request Application submission request
     * @return Created application information
     */
    @PostMapping
    public ResponseEntity<ApplicationResponse> submitApplication(
            @Valid @RequestBody ApplicationRequest request) {
        log.info("Submitting application for user: {} and scholarship: {}", 
                request.getUserNm(), request.getScholarshipNm());
        ApplicationResponse application = applicationService.submitApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    /**
     * Approve an application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @param request Review request with reason and reviewer
     * @return Updated application information
     */
    @PutMapping("/{userNm}/{scholarshipNm}/approve")
    public ResponseEntity<ApplicationResponse> approveApplication(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm,
            @Valid @RequestBody ApplicationReviewRequest request) {
        log.info("Approving application for user: {} and scholarship: {} by reviewer: {}", 
                userNm, scholarshipNm, request.getReviewedBy());
        ApplicationResponse application = applicationService.approveApplication(userNm, scholarshipNm, request);
        return ResponseEntity.ok(application);
    }

    /**
     * Reject an application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @param request Review request with reason and reviewer
     * @return Updated application information
     */
    @PutMapping("/{userNm}/{scholarshipNm}/reject")
    public ResponseEntity<ApplicationResponse> rejectApplication(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm,
            @Valid @RequestBody ApplicationReviewRequest request) {
        log.info("Rejecting application for user: {} and scholarship: {} by reviewer: {}", 
                userNm, scholarshipNm, request.getReviewedBy());
        ApplicationResponse application = applicationService.rejectApplication(userNm, scholarshipNm, request);
        return ResponseEntity.ok(application);
    }

    /**
     * Upload document for application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @param request Document upload request
     * @return Uploaded document information
     */
    @PostMapping("/{userNm}/{scholarshipNm}/documents")
    public ResponseEntity<ApplicationDocumentResponse> uploadDocument(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm,
            @Valid @RequestBody ApplicationDocumentRequest request) {
        log.info("Uploading document for user: {} and scholarship: {}", userNm, scholarshipNm);
        
        // Ensure the request has correct user and scholarship names
        request.setUserNm(userNm);
        request.setScholarshipNm(scholarshipNm);
        
        ApplicationDocumentResponse document = applicationService.uploadDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    /**
     * Get documents for application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return List of application documents
     */
    @GetMapping("/{userNm}/{scholarshipNm}/documents")
    public ResponseEntity<List<ApplicationDocumentResponse>> getApplicationDocuments(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm) {
        log.info("Fetching documents for user: {} and scholarship: {}", userNm, scholarshipNm);
        List<ApplicationDocumentResponse> documents = applicationService.getApplicationDocuments(userNm, scholarshipNm);
        return ResponseEntity.ok(documents);
    }

    /**
     * Delete a document
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @param documentNm Document name
     * @return Success response
     */
    @DeleteMapping("/{userNm}/{scholarshipNm}/documents/{documentNm}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm,
            @PathVariable String documentNm) {
        log.info("Deleting document: {} for user: {} and scholarship: {}", documentNm, userNm, scholarshipNm);
        applicationService.deleteDocument(userNm, scholarshipNm, documentNm);
        return ResponseEntity.noContent().build();
    }
}