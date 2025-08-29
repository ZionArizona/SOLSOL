package com.solsol.heycalendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShinhanApiRequest {
    
    @JsonProperty("Header")
    private Header header;
    
    @JsonProperty("accountNo")
    private String accountNo;
    
    @JsonProperty("startDate")
    private String startDate;
    
    @JsonProperty("endDate")
    private String endDate;
    
    @JsonProperty("transactionType")
    private String transactionType;
    
    @JsonProperty("orderByType")
    private String orderByType;
    
    @JsonProperty("transactionBalance")
    private Long transactionBalance;
    
    @JsonProperty("transactionSummary")
    private String transactionSummary;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Header {
        @JsonProperty("apiName")
        private String apiName;
        
        @JsonProperty("transmissionDate")
        private String transmissionDate;
        
        @JsonProperty("transmissionTime")
        private String transmissionTime;
        
        @JsonProperty("institutionCode")
        private String institutionCode;
        
        @JsonProperty("fintechAppNo")
        private String fintechAppNo;
        
        @JsonProperty("apiServiceCode")
        private String apiServiceCode;
        
        @JsonProperty("institutionTransactionUniqueNo")
        private String institutionTransactionUniqueNo;
        
        @JsonProperty("apiKey")
        private String apiKey;
        
        @JsonProperty("userKey")
        private String userKey;
        
        public static Header createDefault(String apiName, String apiKey, String userKey) {
            LocalDate now = LocalDate.now();
            LocalTime time = LocalTime.now();
            
            return Header.builder()
                    .apiName(apiName)
                    .transmissionDate(now.format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                    .transmissionTime(time.format(DateTimeFormatter.ofPattern("HHmmss")))
                    .institutionCode("00100")
                    .fintechAppNo("001")
                    .apiServiceCode(apiName)
                    .institutionTransactionUniqueNo(generateTransactionUniqueNo())
                    .apiKey(apiKey)
                    .userKey(userKey)
                    .build();
        }
        
        private static String generateTransactionUniqueNo() {
            return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
                   System.currentTimeMillis();
        }
    }
}