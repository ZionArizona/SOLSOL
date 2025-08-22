package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Exchange domain entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exchange {
    
    private String exchangeNm;
    private String userNm;
    private Integer amount;
    private ExchangeState state;
    private LocalDateTime appliedAt;
    private LocalDateTime processedAt;
    private String reason;
}