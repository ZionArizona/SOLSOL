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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
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
        @JsonProperty("Header")
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
            private Currency currency;
        }

        @Data
        public static class Currency {
            private String code;
            private String name;
        }
    }


    public void createMemberAndAccount(String userId, String userNm) {
        log.info("===== Shinhan Bank 통합 시작: userId={} =====", userId);
        String userKey = null;
        String accountNo = null;

        try {
            log.info("-> Member 생성 시도: userId={}", userId);
            userKey = createMember(userId);
            log.info("✅ Member 생성 성공: userId={}, userKey={}", userId, userKey);

        } catch (Exception e) {
            log.error("❌ Member 생성 실패: userId={}", userId, e);
            throw e;
        }

        try {
            log.info("-> Account 생성 시도: userKey={}", userKey);
            accountNo = createAccount(userKey);
            log.info("✅ Account 생성 성공: userKey={}, accountNo={}", userKey, accountNo);

        } catch (Exception e) {
            log.error("❌ Account 생성 실패: userKey={}", userKey, e);
            throw e;
        }

        // DB 업데이트를 별도 트랜잭션에서 처리
        updateUserBankInfo(userId, userKey, accountNo);
    }

    private String createMember(String userId) {
        MemberCreationRequest request = MemberCreationRequest.builder()
                .apiKey(apiKey)
                .userId(userId)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MemberCreationRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.debug("Member API 호출: URL={}, request={}", MEMBER_API_URL, objectMapper.writeValueAsString(request));
            ResponseEntity<MemberCreationResponse> response = restTemplate.postForEntity(MEMBER_API_URL, entity, MemberCreationResponse.class);
            MemberCreationResponse body = response.getBody();

            if (body == null || body.getUserKey() == null) {
                log.warn("⚠️ Member API 응답 이상: userId={}", userId);
                throw new RuntimeException("Invalid response from Shinhan Bank member creation API");
            }

            return body.getUserKey();

        } catch (HttpClientErrorException e) {
            String resp = e.getResponseBodyAsString();
            log.error("❌ Member API 오류: userId={}, response={}", userId, resp);
            if (resp != null && resp.contains("E4002")) {
                log.warn("User 이미 존재: userId={}", userId);
                throw new RuntimeException("User already exists", e);
            }
            throw new RuntimeException("Member creation failed", e);
        } catch (Exception e) {
            log.error("❌ Member 생성 예외: userId={}", userId, e);
            throw new RuntimeException("Member creation failed", e);
        }
    }

    private String createAccount(String userKey) {
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String txnNo = generateInstitutionTransactionUniqueNo();

        Header header = Header.builder()
                .apiName("createDemandDepositAccount")
                .transmissionDate(currentDate)
                .transmissionTime(currentTime)
                .institutionCode("00100")
                .fintechAppNo("001")
                .apiServiceCode("createDemandDepositAccount")
                .institutionTransactionUniqueNo(txnNo)
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
            log.debug("Account API 호출: URL={}, request={}", ACCOUNT_API_URL, objectMapper.writeValueAsString(request));
            ResponseEntity<AccountCreationResponse> response = restTemplate.postForEntity(ACCOUNT_API_URL, entity, AccountCreationResponse.class);
            AccountCreationResponse body = response.getBody();

            if (body == null || body.getRec() == null || body.getRec().getAccountNo() == null) {
                log.warn("⚠️ Account API 응답 이상: userKey={}", userKey);
                throw new RuntimeException("Invalid response from Shinhan Bank account creation API");
            }

            return body.getRec().getAccountNo();

        } catch (Exception e) {
            log.error("❌ Account 생성 예외: userKey={}", userKey, e);
            throw new RuntimeException("Account creation failed", e);
        }
    }

    private String generateInstitutionTransactionUniqueNo() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(20);
        for (int i = 0; i < 20; i++) sb.append(random.nextInt(10));
        return sb.toString();
    }
    
    /**
     * 사용자 은행 정보 업데이트 (별도 트랜잭션)
     */
    @Transactional
    private void updateUserBankInfo(String userId, String userKey, String accountNo) {
        try {
            int updated = userMapper.updateUserKeyAndAccountByUserId(userId, userKey, accountNo);
            if (updated != 1) {
                log.error("❌ DB 업데이트 실패: userId={}, userKey={}, accountNo={}", userId, userKey, accountNo);
                throw new IllegalStateException("Failed to update user with userKey and accountNo");
            }
            log.info("===== Shinhan Bank 통합 완료: userId={}, userKey={}, accountNo={} =====", userId, userKey, accountNo);

        } catch (Exception e) {
            log.error("❌ DB 저장 실패: userId={}", userId, e);
            throw e;
        }
    }
}
