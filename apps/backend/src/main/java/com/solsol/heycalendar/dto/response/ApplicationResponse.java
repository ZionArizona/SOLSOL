package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.entity.ApplicationState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for application list and basic application information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    
    private String userNm;
    private String scholarshipNm;
    private ApplicationState state;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String reviewedBy;
    
    // Additional fields for UI display
    private String userDisplayName;
    private String scholarshipDisplayName;
    private int documentCount; // Number of documents uploaded
}