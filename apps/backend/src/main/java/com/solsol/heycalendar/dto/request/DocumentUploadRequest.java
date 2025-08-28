package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadRequest {
    
    @NotBlank(message = "파일명은 필수입니다.")
    private String fileName;
    
    @NotBlank(message = "콘텐츠 타입은 필수입니다.")
    private String contentType;
    
    @NotNull(message = "파일 크기는 필수입니다.")
    @Positive(message = "파일 크기는 0보다 커야 합니다.")
    private Long fileSize;
}