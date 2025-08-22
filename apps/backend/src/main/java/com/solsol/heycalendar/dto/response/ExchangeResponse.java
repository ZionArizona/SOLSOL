package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.domain.ExchangeState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Exchange response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeResponse {
    
    private String exchangeNm;
    private String userNm;
    private Integer amount;
    private ExchangeState state;
    private LocalDateTime appliedAt;
    private LocalDateTime processedAt;
    private String reason;
}