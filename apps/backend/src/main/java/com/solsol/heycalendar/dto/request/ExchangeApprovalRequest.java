package com.solsol.heycalendar.dto.request;

import com.solsol.heycalendar.domain.ExchangeState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * Exchange approval request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeApprovalRequest {
    
    @NotNull(message = "State is required")
    private ExchangeState state;
    
    private String reason;
}