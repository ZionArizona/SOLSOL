package com.solsol.heycalendar.service;

import com.solsol.heycalendar.dto.request.ApplicationDocumentRequest;
import com.solsol.heycalendar.dto.request.ApplicationRequest;
import com.solsol.heycalendar.dto.request.ApplicationReviewRequest;
import com.solsol.heycalendar.dto.response.ApplicationDetailResponse;
import com.solsol.heycalendar.dto.response.ApplicationDocumentResponse;
import com.solsol.heycalendar.dto.response.ApplicationResponse;
import com.solsol.heycalendar.entity.Application;
import com.solsol.heycalendar.entity.ApplicationDocument;
import com.solsol.heycalendar.entity.ApplicationState;
import com.solsol.heycalendar.mapper.ApplicationDocumentMapper;
import com.solsol.heycalendar.mapper.ApplicationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for scholarship application management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationMapper applicationMapper;
    private final ApplicationDocumentMapper applicationDocumentMapper;

    /**
     * Get all applications
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications() {
        log.debug("Fetching all applications");
        List<Application> applications = applicationMapper.findAllApplications();
        return applications.stream()
                .map(this::convertToApplicationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get applications by user
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByUser(String userNm) {
        log.debug("Fetching applications for user: {}", userNm);
        List<Application> applications = applicationMapper.findApplicationsByUser(userNm);
        return applications.stream()
                .map(this::convertToApplicationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get applications by user with scholarship information (new method)
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsWithScholarshipByUser(String userNm) {
        log.debug("Fetching applications with scholarship info for user: {}", userNm);
        return applicationMapper.findApplicationsWithScholarshipByUser(userNm);
    }

    /**
     * Get applications by scholarship with user information (Admin)
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsWithUserByScholarship(Long scholarshipId) {
        log.debug("Fetching applications for scholarship: {}", scholarshipId);
        return applicationMapper.findApplicationsWithUserByScholarship(scholarshipId);
    }

    /**
     * Delete application (Cancel application)
     */
    @Transactional
    public void deleteApplication(String userNm, String scholarshipNm) {
        log.info("Deleting application for user: {} and scholarship: {}", userNm, scholarshipNm);
        
        Application existingApplication = applicationMapper.findApplicationByUserAndScholarship(userNm, scholarshipNm);
        if (existingApplication == null) {
            throw new IllegalArgumentException("신청 내역을 찾을 수 없습니다.");
        }

        if (existingApplication.getState() != ApplicationState.PENDING) {
            throw new IllegalStateException("심사가 완료된 신청은 취소할 수 없습니다.");
        }

        applicationMapper.deleteApplication(userNm, scholarshipNm);
        log.info("Application deleted successfully for user: {} and scholarship: {}", userNm, scholarshipNm);
    }

    /**
     * Get applications by scholarship
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByScholarship(String scholarshipNm) {
        log.debug("Fetching applications for scholarship: {}", scholarshipNm);
        List<Application> applications = applicationMapper.findApplicationsByScholarship(scholarshipNm);
        return applications.stream()
                .map(this::convertToApplicationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get detailed application information
     */
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(String userNm, String scholarshipNm) {
        log.debug("Fetching application detail for user: {} and scholarship: {}", userNm, scholarshipNm);
        
        Application application = applicationMapper.findApplicationByUserAndScholarship(userNm, scholarshipNm);
        if (application == null) {
            throw new IllegalArgumentException("Application not found for user: " + userNm + " and scholarship: " + scholarshipNm);
        }

        List<ApplicationDocument> documents = applicationDocumentMapper.findDocumentsByUserAndScholarship(userNm, scholarshipNm);
        List<ApplicationDocumentResponse> documentResponses = documents.stream()
                .map(this::convertToApplicationDocumentResponse)
                .collect(Collectors.toList());

        return ApplicationDetailResponse.builder()
                .userNm(application.getUserNm())
                .scholarshipNm(application.getScholarshipNm())
                .state(application.getState())
                .appliedAt(application.getAppliedAt())
                .reason(application.getReason())
                .userDisplayName(application.getUserNm()) // Could be enhanced with actual user names
                .scholarshipDisplayName(application.getScholarshipNm()) // Could be enhanced with actual scholarship titles
                .documents(documentResponses)
                .build();
    }

    /**
     * Submit a new application (deprecated - use submitApplicationForUser instead)
     */
    @Deprecated
    public ApplicationResponse submitApplication(ApplicationRequest request) {
        throw new UnsupportedOperationException("This method is deprecated. Use submitApplicationForUser instead.");
    }

    /**
     * Simple application submission for user (new method)
     */
    public ApplicationResponse submitApplicationForUser(String userNm, ApplicationRequest request) {
        log.info("User {} submitting application for scholarship: {}", userNm, request.getScholarshipId());

        // Check if application already exists
        Application existingApplication = applicationMapper.findApplicationByUserAndScholarship(
                userNm, request.getScholarshipId().toString());
        if (existingApplication != null) {
            throw new IllegalStateException("이미 신청한 장학금입니다.");
        }

        // Basic validation - check if scholarship exists would be good here
        if (request.getScholarshipId() == null || request.getScholarshipId() <= 0) {
            throw new IllegalArgumentException("유효하지 않은 장학금 ID입니다.");
        }

        Application application = Application.builder()
                .userNm(userNm)
                .scholarshipNm(request.getScholarshipId().toString())
                .state(ApplicationState.PENDING)
                .appliedAt(LocalDateTime.now())
                .reason(request.getReason())
                .build();

        applicationMapper.insertApplication(application);
        log.info("Application submitted successfully for user: {} and scholarship: {}", 
                userNm, request.getScholarshipId());

        // Return response with scholarship information
        List<ApplicationResponse> responses = applicationMapper.findApplicationsWithScholarshipByUser(userNm);
        return responses.stream()
                .filter(resp -> resp.getScholarshipNm().equals(request.getScholarshipId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("신청 처리 중 오류가 발생했습니다."));
    }

    /**
     * Approve an application
     */
    public ApplicationResponse approveApplication(String userNm, String scholarshipNm, ApplicationReviewRequest request) {
        log.info("Approving application for user: {} and scholarship: {}", userNm, scholarshipNm);

        Application application = getApplicationOrThrow(userNm, scholarshipNm);
        
        if (application.getState() != ApplicationState.PENDING) {
            throw new IllegalStateException("Application must be in PENDING state to be approved. Current state: " + application.getState());
        }

        application.setState(ApplicationState.APPROVED);
        application.setReason(request.getReason());

        applicationMapper.updateApplication(application);
        log.info("Application approved successfully for user: {} and scholarship: {}", userNm, scholarshipNm);

        return convertToApplicationResponse(application);
    }

    /**
     * Reject an application
     */
    public ApplicationResponse rejectApplication(String userNm, String scholarshipNm, ApplicationReviewRequest request) {
        log.info("Rejecting application for user: {} and scholarship: {}", userNm, scholarshipNm);

        Application application = getApplicationOrThrow(userNm, scholarshipNm);
        
        if (application.getState() != ApplicationState.PENDING) {
            throw new IllegalStateException("Application must be in PENDING state to be rejected. Current state: " + application.getState());
        }

        application.setState(ApplicationState.REJECTED);
        application.setReason(request.getReason());

        applicationMapper.updateApplication(application);
        log.info("Application rejected successfully for user: {} and scholarship: {}", userNm, scholarshipNm);

        return convertToApplicationResponse(application);
    }

    /**
     * Upload document for application
     */
    public ApplicationDocumentResponse uploadDocument(ApplicationDocumentRequest request) {
        log.info("Uploading document for user: {} and scholarship: {}", request.getUserNm(), request.getScholarshipNm());

        // Verify application exists
        Application application = getApplicationOrThrow(request.getUserNm(), request.getScholarshipNm());

        // Check if document with same name already exists
        ApplicationDocument existingDocument = applicationDocumentMapper.findDocumentByNameAndApplication(
                request.getApplicationDocumentNm(), request.getUserNm(), request.getScholarshipNm());
        if (existingDocument != null) {
            throw new IllegalStateException("Document with name '" + request.getApplicationDocumentNm() + 
                    "' already exists for this application");
        }

        ApplicationDocument document = ApplicationDocument.builder()
                .applicationDocumentNm(request.getApplicationDocumentNm())
                .userNm(request.getUserNm())
                .scholarshipNm(request.getScholarshipNm())
                .fileUrl(request.getFileUrl())
                .uploadedAt(LocalDateTime.now())
                .originalFileName(request.getOriginalFileName())
                .fileSize(request.getFileSize())
                .contentType(request.getContentType())
                .build();

        applicationDocumentMapper.insertDocument(document);
        log.info("Document uploaded successfully: {} for user: {} and scholarship: {}", 
                request.getApplicationDocumentNm(), request.getUserNm(), request.getScholarshipNm());

        return convertToApplicationDocumentResponse(document);
    }

    /**
     * Get documents for application
     */
    @Transactional(readOnly = true)
    public List<ApplicationDocumentResponse> getApplicationDocuments(String userNm, String scholarshipNm) {
        log.debug("Fetching documents for user: {} and scholarship: {}", userNm, scholarshipNm);

        // Verify application exists
        getApplicationOrThrow(userNm, scholarshipNm);

        List<ApplicationDocument> documents = applicationDocumentMapper.findDocumentsByUserAndScholarship(userNm, scholarshipNm);
        return documents.stream()
                .map(this::convertToApplicationDocumentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a document
     */
    public void deleteDocument(String userNm, String scholarshipNm, String documentNm) {
        log.info("Deleting document: {} for user: {} and scholarship: {}", documentNm, userNm, scholarshipNm);

        // Verify application exists
        getApplicationOrThrow(userNm, scholarshipNm);

        ApplicationDocument document = applicationDocumentMapper.findDocumentByNameAndApplication(
                documentNm, userNm, scholarshipNm);
        if (document == null) {
            throw new IllegalArgumentException("Document not found: " + documentNm);
        }

        applicationDocumentMapper.deleteDocument(documentNm, userNm, scholarshipNm);
        log.info("Document deleted successfully: {} for user: {} and scholarship: {}", documentNm, userNm, scholarshipNm);
    }

    /**
     * Validate eligibility for scholarship application
     * This is a placeholder method - implement based on actual business rules
     */
    private void validateEligibility(String userNm, String scholarshipNm) {
        log.debug("Validating eligibility for user: {} and scholarship: {}", userNm, scholarshipNm);
        
        // TODO: Implement actual eligibility validation logic
        // Examples:
        // - Check user's academic standing
        // - Verify application deadlines
        // - Check if user has already received this scholarship
        // - Validate required prerequisites
        
        // For now, we'll just check if the user and scholarship names are not empty
        if (userNm == null || userNm.trim().isEmpty()) {
            throw new IllegalArgumentException("User name is required for eligibility validation");
        }
        if (scholarshipNm == null || scholarshipNm.trim().isEmpty()) {
            throw new IllegalArgumentException("Scholarship name is required for eligibility validation");
        }
        
        log.debug("Eligibility validation passed for user: {} and scholarship: {}", userNm, scholarshipNm);
    }

    /**
     * Get application or throw exception if not found
     */
    private Application getApplicationOrThrow(String userNm, String scholarshipNm) {
        Application application = applicationMapper.findApplicationByUserAndScholarship(userNm, scholarshipNm);
        if (application == null) {
            throw new IllegalArgumentException("Application not found for user: " + userNm + " and scholarship: " + scholarshipNm);
        }
        return application;
    }

    /**
     * Convert Application entity to ApplicationResponse DTO
     */
    private ApplicationResponse convertToApplicationResponse(Application application) {
        // Count documents for this application
        int documentCount = applicationDocumentMapper.countDocumentsByUserAndScholarship(
                application.getUserNm(), application.getScholarshipNm());

        return ApplicationResponse.builder()
                .userNm(application.getUserNm())
                .scholarshipNm(Long.valueOf(application.getScholarshipNm()))
                .state(application.getState())
                .appliedAt(application.getAppliedAt())
                .reason(application.getReason())
                .build();
    }

    /**
     * Convert ApplicationDocument entity to ApplicationDocumentResponse DTO
     */
    private ApplicationDocumentResponse convertToApplicationDocumentResponse(ApplicationDocument document) {
        return ApplicationDocumentResponse.builder()
                .applicationDocumentNm(document.getApplicationDocumentNm())
                .userNm(document.getUserNm())
                .scholarshipNm(document.getScholarshipNm())
                .fileUrl(document.getFileUrl())
                .uploadedAt(document.getUploadedAt())
                .originalFileName(document.getOriginalFileName())
                .fileSize(document.getFileSize())
                .contentType(document.getContentType())
                .formattedFileSize(formatFileSize(document.getFileSize()))
                .downloadUrl(document.getFileUrl()) // For now, same as fileUrl
                .build();
    }

    /**
     * Format file size for display
     */
    private String formatFileSize(Long fileSize) {
        if (fileSize == null || fileSize <= 0) {
            return "Unknown";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        double size = fileSize;
        int unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.1f %s", size, units[unitIndex]);
    }
}