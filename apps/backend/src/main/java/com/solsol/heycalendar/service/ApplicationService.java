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
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import com.solsol.heycalendar.dto.request.MileageRequest;
import com.solsol.heycalendar.service.MileageService;

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
    private final S3Presigner s3Presigner;
    private final MileageService mileageService;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;

    /**
     * Get all applications with scholarship information (Admin)
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications() {
        log.debug("Fetching all applications with scholarship information");
        List<ApplicationResponse> applications = applicationMapper.findAllApplicationsWithScholarship();
        
        // 각 application에 대해 관련 documents 조회 및 Presigned URL 생성
        for (ApplicationResponse application : applications) {
            List<ApplicationDocumentResponse> documents = applicationDocumentMapper.findDocumentsByApplication(
                application.getUserNm(), String.valueOf(application.getScholarshipNm())
            );
            
            // 각 document의 fileUrl을 Presigned URL로 변환
            for (ApplicationDocumentResponse document : documents) {
                if (document.getFileUrl() != null) {
                    try {
                        String presignedUrl = generateApplicationDocumentDownloadUrl(document.getFileUrl());
                        document.setFileUrl(presignedUrl);
                    } catch (Exception e) {
                        log.warn("Failed to generate presigned URL for document: {}", document.getFileUrl(), e);
                        // Presigned URL 생성 실패 시 원본 URL 유지
                    }
                }
            }
            
            application.setDocuments(documents);
        }
        
        return applications;
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
     * Get detailed application information with user and scholarship info
     */
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(String userNm, String scholarshipNm) {
        log.debug("Fetching application detail for user: {} and scholarship: {}", userNm, scholarshipNm);
        
        // Get application with user and scholarship information
        ApplicationResponse applicationResponse = applicationMapper.findApplicationDetailByUserAndScholarship(userNm, scholarshipNm);
        if (applicationResponse == null) {
            throw new IllegalArgumentException("Application not found for user: " + userNm + " and scholarship: " + scholarshipNm);
        }

        // Get documents for this application
        List<ApplicationDocument> documents = applicationDocumentMapper.findDocumentsByUserAndScholarship(userNm, scholarshipNm);
        List<ApplicationDocumentResponse> documentResponses = documents.stream()
                .map(this::convertToApplicationDocumentResponse)
                .collect(Collectors.toList());
        
        // Convert fileUrls to Presigned URLs
        for (ApplicationDocumentResponse document : documentResponses) {
            if (document.getFileUrl() != null) {
                try {
                    String presignedUrl = generateApplicationDocumentDownloadUrl(document.getFileUrl());
                    document.setFileUrl(presignedUrl);
                } catch (Exception e) {
                    log.warn("Failed to generate presigned URL for document: {}", document.getFileUrl(), e);
                    // Presigned URL 생성 실패 시 원본 URL 유지
                }
            }
        }

        return ApplicationDetailResponse.builder()
                .userNm(applicationResponse.getUserNm())
                .scholarshipNm(applicationResponse.getScholarshipNm() != null ? applicationResponse.getScholarshipNm().toString() : null)
                .state(applicationResponse.getState())
                .appliedAt(applicationResponse.getAppliedAt())
                .reason(applicationResponse.getReason())
                .userDisplayName(applicationResponse.getUserName() != null ? applicationResponse.getUserName() : applicationResponse.getUserNm())
                .scholarshipDisplayName(applicationResponse.getScholarshipName())
                .userName(applicationResponse.getUserName())
                .departmentName(applicationResponse.getDepartmentName())
                .collegeName(applicationResponse.getCollegeName())
                .universityName(applicationResponse.getUniversityName())
                .scholarshipName(applicationResponse.getScholarshipName())
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

        // 제출서류 저장
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            for (ApplicationRequest.DocumentInfo docInfo : request.getDocuments()) {
                ApplicationDocument document = ApplicationDocument.builder()
                        .userNm(userNm)
                        .scholarshipNm(request.getScholarshipId().toString())
                        .fileUrl(docInfo.getFileUrl())
                        .originalFileName(docInfo.getFileName())
                        .uploadedAt(LocalDateTime.now())
                        .build();
                
                applicationDocumentMapper.insertApplicationDocument(document);
                log.info("Document uploaded for application - User: {}, Scholarship: {}, File: {}", 
                        userNm, request.getScholarshipId(), docInfo.getFileName());
            }
        }

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
                .userName(application.getUserNm()) // 프론트엔드가 기대하는 필드
                .applicationDate(application.getAppliedAt()) // 프론트엔드가 기대하는 필드 
                .applicationState(application.getState()) // 프론트엔드가 기대하는 필드
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

    /**
     * Generate presigned URL for application document download
     */
    public String generateApplicationDocumentDownloadUrl(String fileUrl) {
        try {
            log.info("🔄 Presigned URL 생성 시작 - 원본 URL: {}", fileUrl);
            
            // S3 URL에서 object key 추출
            String objectKey = extractObjectKeyFromS3Url(fileUrl);
            log.info("🔑 추출된 Object Key: {}", objectKey);
            
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // 10분 유효
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            String presignedUrl = presignedRequest.url().toString();
            
            log.info("✅ Presigned URL 생성 완료: {}", presignedUrl.substring(0, Math.min(presignedUrl.length(), 100)) + "...");
            
            return presignedUrl;
            
        } catch (Exception e) {
            log.error("❌ Application document download URL 생성 실패 - fileUrl: {}", fileUrl, e);
            throw new RuntimeException("파일 다운로드 URL 생성에 실패했습니다.", e);
        }
    }

    /**
     * Extract object key from S3 URL
     */
    private String extractObjectKeyFromS3Url(String s3Url) {
        // S3 URL 형태: https://heycalendar.s3.amazonaws.com/documents/김소연/1756366962035_5518dd81.pdf
        // 또는: https://s3.amazonaws.com/heycalendar/documents/김소연/1756366962035_5518dd81.pdf
        
        if (s3Url.contains("amazonaws.com/")) {
            String[] parts = s3Url.split("amazonaws.com/");
            if (parts.length > 1) {
                return parts[1];
            }
        }
        
        // 만약 이미 object key 형태라면 그대로 반환
        if (!s3Url.startsWith("http")) {
            return s3Url;
        }
        
        throw new IllegalArgumentException("올바르지 않은 S3 URL 형태입니다: " + s3Url);
    }

    /**
     * Approve application document and award mileage
     */
    @Transactional
    public void approveApplicationDocument(String userNm, String scholarshipNm, Integer mileage) {
        try {
            log.info("📋 서류 승인 및 마일리지 지급 시작 - User: {}, Scholarship: {}, Mileage: {}", 
                    userNm, scholarshipNm, mileage);
            
            // 신청서 존재 확인
            Application application = applicationMapper.findApplicationByUserAndScholarship(userNm, scholarshipNm);
            if (application == null) {
                throw new IllegalArgumentException("신청서를 찾을 수 없습니다.");
            }
            
            // 신청서 상태를 APPROVED로 변경
            application.setState(ApplicationState.APPROVED);
            applicationMapper.updateApplication(application);
            log.info("✅ 신청서 상태를 APPROVED로 변경 완료");
            
            // 마일리지 지급
            if (mileage > 0) {
                MileageRequest mileageRequest = MileageRequest.builder()
                        .userNm(userNm)
                        .amount(mileage)
                        .description("서류 승인 - " + scholarshipNm)
                        .build();
                
                mileageService.addMileage(mileageRequest);
                log.info("💰 마일리지 지급 완료 - User: {}, Amount: {}", userNm, mileage);
            }
            
            log.info("🎉 서류 승인 및 마일리지 지급 완료");
            
        } catch (Exception e) {
            log.error("❌ 서류 승인 실패 - User: {}, Scholarship: {}", userNm, scholarshipNm, e);
            throw new RuntimeException("서류 승인에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * Reject application document
     */
    @Transactional
    public void rejectApplicationDocument(String userNm, String scholarshipNm) {
        try {
            log.info("📋 서류 반려 시작 - User: {}, Scholarship: {}", userNm, scholarshipNm);
            
            // 신청서 존재 확인
            Application application = applicationMapper.findApplicationByUserAndScholarship(userNm, scholarshipNm);
            if (application == null) {
                throw new IllegalArgumentException("신청서를 찾을 수 없습니다.");
            }
            
            // 신청서 상태를 REJECTED로 변경
            application.setState(ApplicationState.REJECTED);
            applicationMapper.updateApplication(application);
            log.info("✅ 신청서 상태를 REJECTED로 변경 완료");
            
            log.info("🚫 서류 반려 완료");
            
        } catch (Exception e) {
            log.error("❌ 서류 반려 실패 - User: {}, Scholarship: {}", userNm, scholarshipNm, e);
            throw new RuntimeException("서류 반려에 실패했습니다: " + e.getMessage(), e);
        }
    }
}