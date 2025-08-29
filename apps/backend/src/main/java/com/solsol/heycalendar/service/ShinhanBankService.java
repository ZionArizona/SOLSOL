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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
    private static final String BALANCE_API_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountBalance";
    private static final String TRANSACTION_API_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList";
    private static final String DEPOSIT_API_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit";

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

    // 잔액 조회용 Request/Response 클래스들
    @Data
    @Builder
    public static class BalanceInquiryRequest {
        @JsonProperty("Header")
        private Header header;
        private String accountNo;
    }

    @Data
    public static class BalanceInquiryResponse {
        @JsonProperty("Header")
        private ResponseHeader header;
        @JsonProperty("REC")
        private BalanceRec rec;

        @Data
        public static class ResponseHeader {
            private String responseCode;
            private String responseMessage;
        }

        @Data
        public static class BalanceRec {
            private String bankCode;
            private String bankName;
            private String userName;
            private String accountNo;
            private String accountName;
            private String accountTypeCode;
            private String accountTypeName;
            private Long accountBalance;
            private String accountCreatedDate;
            private String accountExpiryDate;
            private String lastTransactionDate;
            private String currency;
        }
    }

    // 거래내역 조회용 Request/Response 클래스들
    @Data
    @Builder
    public static class TransactionHistoryRequest {
        @JsonProperty("Header")
        private Header header;
        private String accountNo;
        private String startDate;
        private String endDate;
        private String transactionType;
        private String orderByType;
    }

    @Data
    public static class TransactionHistoryResponse {
        @JsonProperty("Header")
        private BalanceInquiryResponse.ResponseHeader header;
        @JsonProperty("REC")
        private TransactionRec rec;

        @Data
        public static class TransactionRec {
            private String bankCode;
            private String bankName;
            private String accountNo;
            private Integer totalCount;
            private List<TransactionRecord> list;
        }

        @Data
        public static class TransactionRecord {
            private String transactionUniqueNo;
            private String transactionDate;
            private String transactionTime;
            private String transactionType;
            private String transactionTypeName;
            private String transactionAccountNo;
            private Long transactionBalance;
            private Long transactionAfterBalance;
            private String transactionSummary;
            private String transactionMemo;
        }
    }

    // 입금용 Request/Response 클래스들
    @Data
    @Builder
    public static class DepositRequest {
        @JsonProperty("Header")
        private Header header;
        private String accountNo;
        private Long transactionBalance;
        private String transactionSummary;
    }

    @Data
    public static class DepositResponse {
        @JsonProperty("Header")
        private BalanceInquiryResponse.ResponseHeader header;
        @JsonProperty("REC")
        private DepositRec rec;

        @Data
        public static class DepositRec {
            private String transactionUniqueNo;
            private String accountNo;
            private String transactionDate;
            private String transactionTime;
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
        // 이메일 형식 검증
        if (!isValidEmail(userId)) {
            log.error("❌ 잘못된 이메일 형식: {}", userId);
            throw new IllegalArgumentException("신한은행 API는 유효한 이메일 형식의 userId가 필요합니다: " + userId);
        }
        
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

    /**
     * 계좌 잔액 조회
     */
    public BalanceInquiryResponse inquireAccountBalance(String userKey, String accountNo) {
        try {
            log.info("🏦 신한은행 계좌 잔액 조회 요청 - userKey: {}, accountNo: {}", userKey, accountNo);
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
            String txnNo = generateInstitutionTransactionUniqueNo();

            Header header = Header.builder()
                    .apiName("inquireDemandDepositAccountBalance")
                    .transmissionDate(currentDate)
                    .transmissionTime(currentTime)
                    .institutionCode("00100")
                    .fintechAppNo("001")
                    .apiServiceCode("inquireDemandDepositAccountBalance")
                    .institutionTransactionUniqueNo(txnNo)
                    .apiKey(apiKey)
                    .userKey(userKey)
                    .build();

            BalanceInquiryRequest request = BalanceInquiryRequest.builder()
                    .header(header)
                    .accountNo(accountNo)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BalanceInquiryRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<BalanceInquiryResponse> response = restTemplate.postForEntity(
                    BALANCE_API_URL, entity, BalanceInquiryResponse.class);

            log.info("✅ 신한은행 계좌 잔액 조회 성공 - accountNo: {}", accountNo);
            return response.getBody();

        } catch (Exception e) {
            log.error("❌ 신한은행 계좌 잔액 조회 실패 - accountNo: {}, error: {}", accountNo, e.getMessage(), e);
            throw new RuntimeException("계좌 잔액 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 거래 내역 조회
     */
    public TransactionHistoryResponse inquireTransactionHistory(String userKey, String accountNo, String startDate, String endDate, String transactionType) {
        try {
            log.info("🏦 신한은행 거래 내역 조회 요청 - userKey: {}, accountNo: {}, period: {} ~ {}", 
                    userKey, accountNo, startDate, endDate);
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
            String txnNo = generateInstitutionTransactionUniqueNo();

            Header header = Header.builder()
                    .apiName("inquireTransactionHistoryList")
                    .transmissionDate(currentDate)
                    .transmissionTime(currentTime)
                    .institutionCode("00100")
                    .fintechAppNo("001")
                    .apiServiceCode("inquireTransactionHistoryList")
                    .institutionTransactionUniqueNo(txnNo)
                    .apiKey(apiKey)
                    .userKey(userKey)
                    .build();

            TransactionHistoryRequest request = TransactionHistoryRequest.builder()
                    .header(header)
                    .accountNo(accountNo)
                    .startDate(startDate)
                    .endDate(endDate)
                    .transactionType(transactionType)
                    .orderByType("DESC") // 최근 거래부터
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<TransactionHistoryRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<TransactionHistoryResponse> response = restTemplate.postForEntity(
                    TRANSACTION_API_URL, entity, TransactionHistoryResponse.class);

            TransactionHistoryResponse body = response.getBody();
            log.info("✅ 신한은행 거래 내역 조회 성공 - accountNo: {}, 조회건수: {}", 
                    accountNo, body != null && body.getRec() != null ? body.getRec().getTotalCount() : 0);
            return body;

        } catch (Exception e) {
            log.error("❌ 신한은행 거래 내역 조회 실패 - accountNo: {}, error: {}", accountNo, e.getMessage(), e);
            throw new RuntimeException("거래 내역 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 계좌 입금 (관리자용)
     */
    public DepositResponse depositToAccount(String userKey, String accountNo, Long amount, String summary) {
        try {
            log.info("🏦 신한은행 계좌 입금 요청 - userKey: {}, accountNo: {}, amount: {}", 
                    userKey, accountNo, amount);
            
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
            String txnNo = generateInstitutionTransactionUniqueNo();

            Header header = Header.builder()
                    .apiName("updateDemandDepositAccountDeposit")
                    .transmissionDate(currentDate)
                    .transmissionTime(currentTime)
                    .institutionCode("00100")
                    .fintechAppNo("001")
                    .apiServiceCode("updateDemandDepositAccountDeposit")
                    .institutionTransactionUniqueNo(txnNo)
                    .apiKey(apiKey)
                    .userKey(userKey)
                    .build();

            DepositRequest request = DepositRequest.builder()
                    .header(header)
                    .accountNo(accountNo)
                    .transactionBalance(amount)
                    .transactionSummary(summary != null ? summary : "(수시입출금) : 마일리지 환전")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<DepositRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<DepositResponse> response = restTemplate.postForEntity(
                    DEPOSIT_API_URL, entity, DepositResponse.class);

            log.info("✅ 신한은행 계좌 입금 성공 - accountNo: {}, amount: {}", accountNo, amount);
            return response.getBody();

        } catch (Exception e) {
            log.error("❌ 신한은행 계좌 입금 실패 - accountNo: {}, amount: {}, error: {}", 
                    accountNo, amount, e.getMessage(), e);
            throw new RuntimeException("계좌 입금에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 오늘 날짜를 YYYYMMDD 형식으로 반환
     */
    public String getTodayString() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    /**
     * 지정된 일 수 이전 날짜를 YYYYMMDD 형식으로 반환
     */
    public String getDateBefore(int days) {
        return LocalDate.now().minusDays(days).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
    
    /**
     * 이메일 형식 검증
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // 간단한 이메일 형식 검증 - 신한은행 API가 요구하는 형식
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}
