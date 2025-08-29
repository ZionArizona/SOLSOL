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
    private byte[] objectKeyEnc;         // 암호화된 S3 객체 키
    private byte[] fileNameEnc;          // 암호화된 파일명
    private String contentType;          // MIME type of the file
    private Long fileSize;              // File size in bytes
    private String checksumSha256;       // 파일 무결성 검증용 SHA-256 해시
    private LocalDateTime uploadedAt;    // 업로드 시간
}