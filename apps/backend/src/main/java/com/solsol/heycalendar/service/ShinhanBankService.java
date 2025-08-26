package com.solsol.heycalendar.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ShinhanBankService {

    private final UserMapper userMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${shinhan.api.key}")
    private String apiKey;

    @Value("${shinhan.account.type.unique.no}")
    private String accountTypeUniqueNo;

    private static final String MEMBER_API_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/member/";
    private static final String ACCOUNT_API_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/createDemandDepositAccount";

    @Data
    @Builder
    public static class MemberCreationRequest {
        private String apiKey;
        private String userId;
    }

    @Data
    public static class MemberCreationResponse {
        private String userKey;
        private String status;
        private String message;
    }

    @Data
    @Builder
    public static class AccountCreationRequest {
        private Header Header;
        private String accountTypeUniqueNo;
    }

    @Data
    @Builder
    public static class Header {
        private String apiName;
        private String transmissionDate;
        private String transmissionTime;
        private String institutionCode;
        private String fintechAppNo;
        private String apiServiceCode;
        private String institutionTransactionUniqueNo;
        private String apiKey;
        private String userKey;
    }

    @Data
    public static class AccountCreationResponse {
        @JsonProperty("REC")
        private AccountRec rec;
        
        @Data
        public static class AccountRec {
            private String bankCode;
            private String accountNo;
            private String currency;
        }
    }

    /**
     * 신한은행 사용자 계정 생성 및 계좌 개설
     */
    public void createMemberAndAccount(String userId, String userNm) {
        try {
            log.info("Starting Shinhan Bank member and account creation for userId: {}", userId);
            
            // 1단계: 사용자 계정 생성
            String userKey = createMember(userId);
            log.info("Member created successfully. UserKey: {}", userKey);
            
            // 2단계: 계좌 생성
            String accountNo = createAccount(userKey);
            log.info("Account created successfully. AccountNo: {}", accountNo);
            
            // 3단계: DB에 유저키와 계좌번호 저장
            int updated = userMapper.updateUserKeyAndAccountByUserId(userId, userKey, accountNo);
            if (updated != 1) {
                throw new IllegalStateException("Failed to update user with userKey and accountNo");
            }
            
            log.info("Successfully completed Shinhan Bank integration for userId: {}, userKey: {}, accountNo: {}", 
                    userId, userKey, accountNo);
            
        } catch (Exception e) {
            log.error("Failed to create Shinhan Bank member and account for userId: {}", userId, e);
            throw new RuntimeException("Shinhan Bank API integration failed: " + e.getMessage(), e);
        }
    }

    /**
     * 신한은행 사용자 계정 생성
     */
    private String createMember(String userId) {
        MemberCreationRequest request = MemberCreationRequest.builder()
                .apiKey(apiKey)
                .userId(userId)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<MemberCreationRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.debug("Sending member creation request to: {}", MEMBER_API_URL);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<MemberCreationResponse> response = restTemplate.postForEntity(
                    MEMBER_API_URL, entity, MemberCreationResponse.class);

            MemberCreationResponse responseBody = response.getBody();
            if (responseBody == null || responseBody.getUserKey() == null) {
                throw new RuntimeException("Invalid response from Shinhan Bank member creation API");
            }

            log.info("Member creation successful for userId: {}", userId);
            return responseBody.getUserKey();

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize member creation request", e);
            throw new RuntimeException("Failed to create member request", e);
        } catch (Exception e) {
            log.error("Failed to create Shinhan Bank member for userId: {}", userId, e);
            throw new RuntimeException("Member creation failed", e);
        }
    }

    /**
     * 신한은행 계좌 생성
     */
    private String createAccount(String userKey) {
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmm00"));
        String institutionTransactionUniqueNo = generateInstitutionTransactionUniqueNo();

        Header header = Header.builder()
                .apiName("createDemandDepositAccount")
                .transmissionDate(currentDate)
                .transmissionTime(currentTime)
                .institutionCode("00100")
                .fintechAppNo("001")
                .apiServiceCode("createDemandDepositAccount")
                .institutionTransactionUniqueNo(institutionTransactionUniqueNo)
                .apiKey(apiKey)
                .userKey(userKey)
                .build();

        AccountCreationRequest request = AccountCreationRequest.builder()
                .Header(header)
                .accountTypeUniqueNo(accountTypeUniqueNo)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AccountCreationRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.debug("Sending account creation request to: {}", ACCOUNT_API_URL);
            log.debug("Request body: {}", objectMapper.writeValueAsString(request));
            
            ResponseEntity<AccountCreationResponse> response = restTemplate.postForEntity(
                    ACCOUNT_API_URL, entity, AccountCreationResponse.class);

            AccountCreationResponse responseBody = response.getBody();
            if (responseBody == null || responseBody.getRec() == null || responseBody.getRec().getAccountNo() == null) {
                throw new RuntimeException("Invalid response from Shinhan Bank account creation API");
            }

            String accountNo = responseBody.getRec().getAccountNo();
            log.info("Account creation successful. AccountNo: {}", accountNo);
            return accountNo;

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize account creation request", e);
            throw new RuntimeException("Failed to create account request", e);
        } catch (Exception e) {
            log.error("Failed to create Shinhan Bank account for userKey: {}", userKey, e);
            throw new RuntimeException("Account creation failed", e);
        }
    }

    /**
     * 20자리 난수 생성
     */
    private String generateInstitutionTransactionUniqueNo() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(20);
        
        for (int i = 0; i < 20; i++) {
            sb.append(random.nextInt(10));
        }
        
        return sb.toString();
    }
}