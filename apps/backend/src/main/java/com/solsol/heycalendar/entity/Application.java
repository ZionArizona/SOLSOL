package com.solsol.heycalendar.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Application entity representing scholarship applications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    
    private String userNm;           // Primary Key / Foreign Key
    private String scholarshipNm;    // Primary Key / Foreign Key
    private ApplicationState state;  // PENDING, APPROVED, REJECTED
    private LocalDateTime appliedAt;
    private String reason;           // Reason for rejection or additional notes
    
    // Additional fields for better management
    private LocalDateTime updatedAt;
    private String reviewedBy;       // Who reviewed the application
}