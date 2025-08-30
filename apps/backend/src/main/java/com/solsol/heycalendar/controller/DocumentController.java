package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.dto.request.DocumentUploadRequest;
import com.solsol.heycalendar.dto.response.DocumentUploadResponse;
import com.solsol.heycalendar.dto.response.DocumentListResponse;
import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "document", description = "서류 관리 API")
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "서류 업로드 URL 생성", description = "서류 업로드를 위한 Presigned URL을 생성합니다.")
    @PostMapping("/upload-url")
    public ResponseEntity<ApiResponse<DocumentUploadResponse>> generateUploadUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DocumentUploadRequest request) {
        
        try {
            String userNm = userDetails.getUsername();
            DocumentUploadResponse response = documentService.generateDocumentUploadUrl(userNm, request);
            
            return ResponseEntity.ok(ApiResponse.success("업로드 URL이 생성되었습니다.", response));
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 - userNm: {}, error: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        } catch (Exception e) {
            log.error("업로드 URL 생성 실패 - userNm: {}", userDetails.getUsername(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("INTERNAL_ERROR", "업로드 URL 생성에 실패했습니다."));
        }
    }

    @Operation(summary = "서류 업로드 완료", description = "서류 업로드 완료 후 DB에 정보를 저장합니다.")
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<Void>> completeUpload(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        
        try {
            String userNm = userDetails.getUsername();
            log.info("🔍 DocumentController - userDetails.getUsername(): {}", userNm);
            log.info("🔍 DocumentController - userDetails class: {}", userDetails.getClass().getName());
            if (userDetails instanceof com.solsol.heycalendar.security.CustomUserPrincipal) {
                com.solsol.heycalendar.security.CustomUserPrincipal principal = 
                    (com.solsol.heycalendar.security.CustomUserPrincipal) userDetails;
                log.info("🔍 CustomUserPrincipal - userNm: {}", principal.getUserNm());
            }
            String objectKey = (String) request.get("objectKey");
            String checksum = (String) request.get("checksum");
            
            DocumentUploadRequest uploadRequest = DocumentUploadRequest.builder()
                    .fileName((String) request.get("fileName"))
                    .contentType((String) request.get("contentType"))
                    .fileSize(Long.valueOf(request.get("fileSize").toString()))
                    .build();
            
            documentService.completeDocumentUpload(userNm, objectKey, uploadRequest, checksum);
            
            return ResponseEntity.ok(ApiResponse.success("서류 업로드가 완료되었습니다.", null));
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 - userNm: {}, error: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        } catch (Exception e) {
            log.error("업로드 완료 처리 실패 - userNm: {}", userDetails.getUsername(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("INTERNAL_ERROR", "업로드 완료 처리에 실패했습니다."));
        }
    }

    @Operation(summary = "내 서류 목록 조회", description = "사용자의 서류 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentListResponse>>> getMyDocuments(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            String userNm = userDetails.getUsername();
            List<DocumentListResponse> documents = documentService.getUserDocuments(userNm);
            
            return ResponseEntity.ok(ApiResponse.success("서류 목록을 조회했습니다.", documents));
            
        } catch (Exception e) {
            log.error("서류 목록 조회 실패 - userNm: {}", userDetails.getUsername(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("INTERNAL_ERROR", "서류 목록 조회에 실패했습니다."));
        }
    }

    @Operation(summary = "서류 다운로드 URL 생성", description = "서류 다운로드를 위한 Presigned URL을 생성합니다.")
    @GetMapping("/{documentId}/download-url")
    public ResponseEntity<ApiResponse<String>> generateDownloadUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long documentId) {
        
        try {
            String userNm = userDetails.getUsername();
            String downloadUrl = documentService.generateDownloadUrl(userNm, documentId);
            
            return ResponseEntity.ok(ApiResponse.success("다운로드 URL이 생성되었습니다.", downloadUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 - userNm: {}, documentId: {}, error: {}", 
                    userDetails.getUsername(), documentId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        } catch (Exception e) {
            log.error("다운로드 URL 생성 실패 - userNm: {}, documentId: {}", 
                    userDetails.getUsername(), documentId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("INTERNAL_ERROR", "다운로드 URL 생성에 실패했습니다."));
        }
    }

    @Operation(summary = "서류 삭제", description = "서류를 삭제합니다.")
    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long documentId) {
        
        try {
            String userNm = userDetails.getUsername();
            documentService.deleteDocument(userNm, documentId);
            
            return ResponseEntity.ok(ApiResponse.success("서류가 삭제되었습니다.", null));
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 - userNm: {}, documentId: {}, error: {}", 
                    userDetails.getUsername(), documentId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        } catch (Exception e) {
            log.error("서류 삭제 실패 - userNm: {}, documentId: {}", 
                    userDetails.getUsername(), documentId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("INTERNAL_ERROR", "서류 삭제에 실패했습니다."));
        }
    }
}
