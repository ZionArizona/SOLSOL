package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.entity.ApplicationState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for detailed application information including documents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResponse {
    
    private String userNm;
    private String scholarshipNm;
    private ApplicationState state;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String reason;
    private String reviewedBy;
    
    // Additional fields for UI display
    private String userDisplayName;
    private String scholarshipDisplayName;
    
    // Associated documents
    private List<ApplicationDocumentResponse> documents;
    
    // Application timeline/history
    private List<ApplicationStatusHistory> statusHistory;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationStatusHistory {
        private ApplicationState status;
        private LocalDateTime timestamp;
        private String reason;
        private String reviewedBy;
    }
}