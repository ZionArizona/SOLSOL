package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * User mileage response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMileageResponse {
    
    private String userNm;
    private Integer totalMileage;
    private Integer availableMileage;
    private Integer pendingExchange;
    private List<MileageResponse> mileageHistory;
    private List<ExchangeResponse> exchangeHistory;
}