package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.dto.request.ApplicationDocumentRequest;
import com.solsol.heycalendar.dto.request.ApplicationRequest;
import com.solsol.heycalendar.dto.request.ApplicationReviewRequest;
import com.solsol.heycalendar.dto.response.ApplicationDetailResponse;
import com.solsol.heycalendar.dto.response.ApplicationDocumentResponse;
import com.solsol.heycalendar.dto.response.ApplicationResponse;
import com.solsol.heycalendar.entity.ApplicationState;
import com.solsol.heycalendar.dto.request.DocumentUploadRequest;
import com.solsol.heycalendar.dto.response.DocumentUploadResponse;
import com.solsol.heycalendar.service.ApplicationService;
import com.solsol.heycalendar.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "장학금 신청", description = "장학금 신청 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Validated
public class ApplicationController {

    private final ApplicationService applicationService;
    private final DocumentService documentService;

    @Operation(summary = "전체 장학금 신청 목록 조회", description = "시스템에 등록된 모든 장학금 신청 내역을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAllApplications() {
        log.info("Fetching all applications");
        List<ApplicationResponse> applications = applicationService.getAllApplications();
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", applications));
    }

    @Operation(summary = "사용자별 장학금 신청 내역 조회", description = "특정 사용자가 신청한 장학금 목록을 조회합니다.")
    @GetMapping("/user/{userNm}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByUser(
            @PathVariable String userNm) {
        log.info("Fetching applications for user: {}", userNm);
        List<ApplicationResponse> applications = applicationService.getApplicationsByUser(userNm);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "장학금별 신청자 목록 조회", description = "특정 장학금에 대한 모든 신청자 목록을 조회합니다.")
    @GetMapping("/scholarship/{scholarshipNm}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByScholarship(
            @PathVariable String scholarshipNm) {
        log.info("Fetching applications for scholarship: {}", scholarshipNm);
        List<ApplicationResponse> applications = applicationService.getApplicationsByScholarship(scholarshipNm);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "장학금 신청 상세 정보 조회", description = "특정 사용자의 특정 장학금 신청에 대한 상세 정보를 조회합니다.")
    @GetMapping("/{userNm}/{scholarshipNm}")
    public ResponseEntity<ApplicationDetailResponse> getApplicationDetail(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm) {
        log.info("Fetching application detail for user: {} and scholarship: {}", userNm, scholarshipNm);
        ApplicationDetailResponse application = applicationService.getApplicationDetail(userNm, scholarshipNm);
        return ResponseEntity.ok(application);
    }

    @Operation(summary = "장학금 신청", description = "새로운 장학금 신청을 제출합니다.")
    @PostMapping
    public ResponseEntity<ApplicationResponse> submitApplication(
            @RequestHeader("user-nm") String userNm,
            @Valid @RequestBody ApplicationRequest request) {
        log.info("user {} submitting application for scholarship: {}", userNm, request.getScholarshipId());
        ApplicationResponse application = applicationService.submitApplicationForUser(userNm, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    @Operation(summary = "장학금 신청 승인", description = "장학금 신청을 승인 처리합니다.")
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

    @Operation(summary = "장학금 신청 거부", description = "장학금 신청을 거부 처리합니다.")
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

    @Operation(summary = "신청서류 업로드", description = "장학금 신청에 필요한 서류를 업로드합니다.")
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

    @Operation(summary = "신청서류 목록 조회", description = "특정 장학금 신청에 업로드된 서류 목록을 조회합니다.")
    @GetMapping("/{userNm}/{scholarshipNm}/documents")
    public ResponseEntity<List<ApplicationDocumentResponse>> getApplicationDocuments(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm) {
        log.info("Fetching documents for user: {} and scholarship: {}", userNm, scholarshipNm);
        List<ApplicationDocumentResponse> documents = applicationService.getApplicationDocuments(userNm, scholarshipNm);
        return ResponseEntity.ok(documents);
    }

    @Operation(summary = "신청서류 삭제", description = "업로드된 장학금 신청 서류를 삭제합니다.")
    @DeleteMapping("/{userNm}/{scholarshipNm}/documents/{documentNm}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String userNm,
            @PathVariable String scholarshipNm,
            @PathVariable String documentNm) {
        log.info("Deleting document: {} for user: {} and scholarship: {}", documentNm, userNm, scholarshipNm);
        applicationService.deleteDocument(userNm, scholarshipNm, documentNm);
        return ResponseEntity.noContent().build();
    }

    /* === Document Upload APIs === */

    @Operation(summary = "장학금 신청 서류 업로드 URL 생성", description = "장학금 신청 서류 업로드용 Presigned URL을 생성합니다.")
    @PostMapping("/student/documents/upload-url")
    public ResponseEntity<ApiResponse<DocumentUploadResponse>> generateApplicationDocumentUploadUrl(
            @RequestHeader("user-nm") String userNm,
            @RequestParam String scholarshipNm,
            @Valid @RequestBody DocumentUploadRequest request) {
        
        DocumentUploadResponse response = documentService.generateApplicationDocumentUploadUrl(userNm, scholarshipNm, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "업로드 URL이 생성되었습니다.", "OK", response));
    }

    @Operation(summary = "장학금 신청 서류 업로드 완료", description = "장학금 신청 서류 업로드를 완료 처리합니다.")
    @PostMapping("/student/documents/complete")
    public ResponseEntity<ApiResponse<Void>> completeApplicationDocumentUpload(
            @RequestHeader("user-nm") String userNm,
            @RequestParam String scholarshipNm,
            @RequestParam String documentNm,
            @RequestBody Map<String, Object> request) {
        
        String objectKey = (String) request.get("objectKey");
        String fileName = (String) request.get("fileName");
        String contentType = (String) request.get("contentType");
        Long fileSize = Long.valueOf(request.get("fileSize").toString());
        String checksum = (String) request.get("checksum");
        
        DocumentUploadRequest uploadRequest = DocumentUploadRequest.builder()
                .fileName(fileName)
                .contentType(contentType)
                .fileSize(fileSize)
                .build();
        
        documentService.completeApplicationDocumentUpload(userNm, scholarshipNm, documentNm, objectKey, uploadRequest, checksum);
        return ResponseEntity.ok(new ApiResponse<>(true, "업로드가 완료되었습니다.", "OK", null));
    }

    @Operation(summary = "장학금 신청 서류 다운로드 URL 생성 (학생용)", description = "장학금 신청 서류 다운로드용 Presigned URL을 생성합니다.")
    @GetMapping("/student/documents/{documentNm}/download-url")
    public ResponseEntity<ApiResponse<String>> generateApplicationDocumentDownloadUrl(
            @RequestHeader("user-nm") String userNm,
            @RequestParam String scholarshipNm,
            @PathVariable String documentNm) {
        
        String downloadUrl = documentService.generateApplicationDocumentDownloadUrl(userNm, scholarshipNm, documentNm);
        return ResponseEntity.ok(new ApiResponse<>(true, "다운로드 URL이 생성되었습니다.", "OK", downloadUrl));
    }

    @Operation(summary = "장학금 신청 서류 다운로드 URL 생성 (Admin용)", description = "Admin이 장학금 신청 서류를 조회할 때 사용하는 Presigned URL을 생성합니다.")
    @GetMapping("/admin/documents/download-url")
    public ResponseEntity<ApiResponse<String>> generateApplicationDocumentDownloadUrlForAdmin(
            @RequestParam String userNm,
            @RequestParam String scholarshipNm,
            @RequestParam String documentNm) {
        
        String downloadUrl = documentService.generateApplicationDocumentDownloadUrl(userNm, scholarshipNm, documentNm);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin 다운로드 URL이 생성되었습니다.", "OK", downloadUrl));
    }

    /* === New User APIs with header authentication === */

    @Operation(summary = "장학금 신청 (사용자)", description = "사용자가 장학금을 신청합니다.")
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForScholarship(
            @RequestHeader("user-nm") String userNm,
            @Valid @RequestBody ApplicationRequest request) {
        
        log.info("user {} applying for scholarship {}", userNm, request.getScholarshipId());
        ApplicationResponse response = applicationService.submitApplicationForUser(userNm, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "신청이 완료되었습니다.", "OK", response));
    }

    @Operation(summary = "내 장학금 신청 목록 조회", description = "내가 신청한 장학금 목록을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            org.springframework.security.core.Authentication authentication) {
        
        com.solsol.heycalendar.security.CustomUserPrincipal principal = 
            (com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal();
        String userNm = principal.getUserNm();
        
        log.info("Getting applications for user: {}", userNm);
        List<ApplicationResponse> applications = applicationService.getApplicationsWithScholarshipByUser(userNm);
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", applications));
    }

    @Operation(summary = "내 장학금 신청 상태별 조회", description = "상태별 내 장학금 신청을 조회합니다.")
    @GetMapping("/my/status/{status}")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplicationsByStatus(
            @RequestHeader("user-nm") String userNm,
            @PathVariable String status) {
        
        log.info("Getting applications for user {} with status: {}", userNm, status);
        List<ApplicationResponse> applications = applicationService.getApplicationsWithScholarshipByUser(userNm);
        
        // 상태별 필터링
        ApplicationState targetState = ApplicationState.valueOf(status.toUpperCase());
        List<ApplicationResponse> filteredApplications = applications.stream()
                .filter(app -> app.getState() == targetState)
                .toList();
        
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", filteredApplications));
    }

    @Operation(summary = "장학금 신청 취소", description = "내가 신청한 장학금을 취소합니다.")
    @DeleteMapping("/cancel/{scholarshipId}")
    public ResponseEntity<ApiResponse<Void>> cancelMyApplication(
            @RequestHeader("user-nm") String userNm,
            @PathVariable Long scholarshipId) {
        
        log.info("user {} cancelling application for scholarship: {}", userNm, scholarshipId);
        applicationService.deleteApplication(userNm, scholarshipId.toString());
        
        return ResponseEntity.ok(new ApiResponse<>(true, "신청이 취소되었습니다.", "OK", null));
    }

    @Operation(summary = "서류 승인 및 마일리지 지급", description = "제출된 서류를 승인하고 마일리지를 지급합니다.")
    @PostMapping("/documents/approve")
    public ResponseEntity<ApiResponse<Void>> approveDocument(@RequestBody Map<String, Object> request) {
        try {
            String userNm = (String) request.get("userNm");
            String scholarshipNm = (String) request.get("scholarshipNm");
            Integer mileage = (Integer) request.get("mileage");
            
            log.info("Approving document - user: {}, Scholarship: {}, Mileage: {}", userNm, scholarshipNm, mileage);
            
            applicationService.approveApplicationDocument(userNm, scholarshipNm, mileage);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "서류가 승인되었으며 마일리지가 지급되었습니다.", "OK", null));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for document approval: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), "INVALID_REQUEST", null));
        } catch (Exception e) {
            log.error("Failed to approve document", e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "서류 승인에 실패했습니다.", "INTERNAL_ERROR", null));
        }
    }

    @Operation(summary = "서류 반려", description = "제출된 서류를 반려합니다.")
    @PostMapping("/documents/reject")
    public ResponseEntity<ApiResponse<Void>> rejectDocument(@RequestBody Map<String, Object> request) {
        try {
            String userNm = (String) request.get("userNm");
            String scholarshipNm = (String) request.get("scholarshipNm");
            
            log.info("Rejecting document - user: {}, Scholarship: {}", userNm, scholarshipNm);
            
            applicationService.rejectApplicationDocument(userNm, scholarshipNm);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "서류가 반려되었습니다.", "OK", null));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for document rejection: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), "INVALID_REQUEST", null));
        } catch (Exception e) {
            log.error("Failed to reject document", e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "서류 반려에 실패했습니다.", "INTERNAL_ERROR", null));
        }
    }

    @Operation(summary = "MyBox 파일을 ApplicationDocument로 복사", description = "사용자의 MyBox에 있는 파일을 장학금 신청 서류로 복사합니다.")
    @PostMapping("/student/documents/copy-from-mybox")
    public ResponseEntity<ApiResponse<Map<String, String>>> copyMyBoxFileToApplicationDocument(
            @RequestHeader("user-nm") String userNm,
            @RequestBody Map<String, Object> request) {
        try {
            String scholarshipNm = (String) request.get("scholarshipNm");
            Integer myboxDocumentId = (Integer) request.get("myboxDocumentId");
            
            log.info("Copying MyBox file to ApplicationDocument - user: {}, scholarship: {}, myboxDocumentId: {}", 
                    userNm, scholarshipNm, myboxDocumentId);
            
            String documentNm = documentService.copyMyBoxFileToApplicationDocument(userNm, scholarshipNm, myboxDocumentId.longValue());
            
            Map<String, String> result = Map.of("documentNm", documentNm);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "MyBox 파일이 장학금 신청 서류로 복사되었습니다.", "OK", result));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for MyBox file copy: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), "INVALID_REQUEST", null));
        } catch (Exception e) {
            log.error("Failed to copy MyBox file to ApplicationDocument", e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "MyBox 파일 복사에 실패했습니다.", "INTERNAL_ERROR", null));
        }
    }
}
