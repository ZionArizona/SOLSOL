package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for application document information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDocumentResponse {
    
    private String applicationDocumentNm;
    private String userNm;
    private String scholarshipNm;
    private String fileUrl;
    private LocalDateTime uploadedAt;
    private String originalFileName;
    private Long fileSize;
    private String contentType;
    
    // Additional fields for UI display
    private String formattedFileSize; // e.g., "2.5 MB"
    private String downloadUrl;       // Secure download URL if different from fileUrl
}