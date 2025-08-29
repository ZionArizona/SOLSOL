package com.solsol.heycalendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShinhanApiResponse {
    
    @JsonProperty("Header")
    private ResponseHeader header;
    
    @JsonProperty("REC")
    private ResponseRecord rec;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseHeader {
        @JsonProperty("responseCode")
        private String responseCode;
        
        @JsonProperty("responseMessage")
        private String responseMessage;
        
        @JsonProperty("apiName")
        private String apiName;
        
        @JsonProperty("transmissionDate")
        private String transmissionDate;
        
        @JsonProperty("transmissionTime")
        private String transmissionTime;
        
        @JsonProperty("institutionCode")
        private String institutionCode;
        
        @JsonProperty("apiKey")
        private String apiKey;
        
        @JsonProperty("apiServiceCode")
        private String apiServiceCode;
        
        @JsonProperty("institutionTransactionUniqueNo")
        private String institutionTransactionUniqueNo;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseRecord {
        @JsonProperty("bankCode")
        private String bankCode;
        
        @JsonProperty("bankName")
        private String bankName;
        
        @JsonProperty("userName")
        private String userName;
        
        @JsonProperty("accountNo")
        private String accountNo;
        
        @JsonProperty("accountName")
        private String accountName;
        
        @JsonProperty("accountTypeCode")
        private String accountTypeCode;
        
        @JsonProperty("accountTypeName")
        private String accountTypeName;
        
        @JsonProperty("accountBalance")
        private Long accountBalance;
        
        @JsonProperty("accountCreatedDate")
        private String accountCreatedDate;
        
        @JsonProperty("accountExpiryDate")
        private String accountExpiryDate;
        
        @JsonProperty("lastTransactionDate")
        private String lastTransactionDate;
        
        @JsonProperty("currency")
        private String currency;
        
        // 거래 내역 조회용
        @JsonProperty("totalCount")
        private Integer totalCount;
        
        @JsonProperty("list")
        private List<TransactionRecord> list;
        
        // 입금 처리용
        @JsonProperty("transactionUniqueNo")
        private String transactionUniqueNo;
        
        @JsonProperty("transactionDate")
        private String transactionDate;
        
        @JsonProperty("transactionTime")
        private String transactionTime;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionRecord {
        @JsonProperty("transactionUniqueNo")
        private String transactionUniqueNo;
        
        @JsonProperty("transactionDate")
        private String transactionDate;
        
        @JsonProperty("transactionTime")
        private String transactionTime;
        
        @JsonProperty("transactionType")
        private String transactionType;
        
        @JsonProperty("transactionTypeName")
        private String transactionTypeName;
        
        @JsonProperty("transactionAccountNo")
        private String transactionAccountNo;
        
        @JsonProperty("transactionBalance")
        private Long transactionBalance;
        
        @JsonProperty("transactionAfterBalance")
        private Long transactionAfterBalance;
        
        @JsonProperty("transactionSummary")
        private String transactionSummary;
        
        @JsonProperty("transactionMemo")
        private String transactionMemo;
    }
}