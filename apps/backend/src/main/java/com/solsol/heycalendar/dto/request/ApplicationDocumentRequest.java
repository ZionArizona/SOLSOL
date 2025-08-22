package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for application document upload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDocumentRequest {
    
    @NotBlank(message = "Document name is required")
    @Size(max = 100, message = "Document name must not exceed 100 characters")
    private String applicationDocumentNm;
    
    @NotBlank(message = "User name is required")
    @Size(max = 100, message = "User name must not exceed 100 characters")
    private String userNm;
    
    @NotBlank(message = "Scholarship name is required")
    @Size(max = 100, message = "Scholarship name must not exceed 100 characters")
    private String scholarshipNm;
    
    @NotBlank(message = "File URL is required")
    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;
    
    @Size(max = 255, message = "Original file name must not exceed 255 characters")
    private String originalFileName;
    
    private Long fileSize;
    
    @Size(max = 100, message = "Content type must not exceed 100 characters")
    private String contentType;
}