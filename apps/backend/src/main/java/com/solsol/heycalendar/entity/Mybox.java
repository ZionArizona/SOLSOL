package com.solsol.heycalendar.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mybox {
    
    private Long id;
    private String userNm;
    private byte[] objectKeyEnc;
    private byte[] fileNameEnc;
    private String contentType;
    private Long sizeBytes;
    private String checksumSha256;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}