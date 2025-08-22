package com.solsol.heycalendar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for application review (approve/reject)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewRequest {
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason; // Reason for approval or rejection
    
    @Size(max = 100, message = "Reviewer name must not exceed 100 characters")
    private String reviewedBy; // Who is reviewing the application
}