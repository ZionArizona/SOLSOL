package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentListResponse {
    
    private Long id;
    private String fileName;
    private String contentType;
    private Long sizeBytes;
    private LocalDateTime createdAt;
}