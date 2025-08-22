package com.solsol.heycalendar.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ApplicationDocument entity representing documents uploaded for scholarship applications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDocument {
    
    private String applicationDocumentNm; // Primary Key
    private String userNm;               // Foreign Key
    private String scholarshipNm;        // Foreign Key
    private String fileUrl;              // URL/path to the uploaded file
    private LocalDateTime uploadedAt;
    
    // Additional fields for better document management
    private String originalFileName;     // Original name of the uploaded file
    private Long fileSize;              // File size in bytes
    private String contentType;         // MIME type of the file
}