package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.domain.Exchange;
import com.solsol.heycalendar.domain.ExchangeState;
import com.solsol.heycalendar.service.ExchangeService;
import com.solsol.heycalendar.service.ShinhanBankService.BalanceInquiryResponse;
import com.solsol.heycalendar.service.ShinhanBankService.TransactionHistoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
// @CrossOrigin(origins = {"http://localhost:8081", "http://localhost:5173"}, allowCredentials = "true")
public class ExchangeController {
    
    private final ExchangeService exchangeService;
    
    /**
     * 환전 신청
     */
    @PostMapping("/request")
    public ResponseEntity<?> requestExchange(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            Integer amount = (Integer) request.get("amount");
            
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "올바른 금액을 입력해주세요"));
            }
            
            Exchange exchange = exchangeService.requestExchange(userNm, amount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "환전 신청이 완료되었습니다",
                "exchange", exchange
            ));
            
        } catch (Exception e) {
            log.error("환전 신청 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 사용자 환전 내역 조회
     */
    @GetMapping("/history")
    public ResponseEntity<?> getExchangeHistory(Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            List<Exchange> history = exchangeService.getUserExchangeHistory(userNm);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", history
            ));
            
        } catch (Exception e) {
            log.error("환전 내역 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 계좌 잔액 조회
     */
    @GetMapping("/account/balance")
    public ResponseEntity<?> getAccountBalance(Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            BalanceInquiryResponse balance = exchangeService.getUserAccountBalance(userNm);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", balance
            ));
            
        } catch (Exception e) {
            log.error("계좌 잔액 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 거래 내역 조회
     */
    @GetMapping("/account/transactions")
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            TransactionHistoryResponse transactions = exchangeService.getUserTransactionHistory(userNm, days);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", transactions
            ));
            
        } catch (Exception e) {
            log.error("거래 내역 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 관리자용 API들
    
    /**
     * 같은 대학 사용자들의 마일리지 조회 (관리자용)
     */
    @GetMapping("/admin/university-mileages")
    public ResponseEntity<?> getUniversityUsersMileage(Authentication authentication) {
        try {
            String adminUserNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            
            Map<String, Object> result = exchangeService.getUniversityUsersMileage(adminUserNm);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
            
        } catch (Exception e) {
            log.error("대학 사용자 마일리지 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 마일리지 환전 처리 (관리자용)
     */
    @PostMapping("/admin/convert-mileage")
    public ResponseEntity<?> convertUserMileage(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String adminUserNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            
            String targetUserNm = (String) request.get("userNm");
            Integer mileageAmount = (Integer) request.get("mileageAmount");
            
            if (targetUserNm == null || mileageAmount == null || mileageAmount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "필수 파라미터가 누락되었습니다"));
            }
            
            exchangeService.convertMileageToMoney(targetUserNm, mileageAmount, adminUserNm);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "마일리지 환전이 완료되었습니다"
            ));
            
        } catch (Exception e) {
            log.error("마일리지 환전 처리 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 전체 환전 신청 조회 (관리자용)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllExchangeRequests(Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            // TODO: 관리자 권한 체크 추가
            
            List<Exchange> exchanges = exchangeService.getAllExchangeRequests();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", exchanges
            ));
            
        } catch (Exception e) {
            log.error("환전 신청 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 대기 중인 환전 신청 조회 (관리자용)
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingExchangeRequests(Authentication authentication) {
        try {
            String userNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            // TODO: 관리자 권한 체크 추가
            
            List<Exchange> exchanges = exchangeService.getExchangeRequestsByState(ExchangeState.PENDING);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", exchanges
            ));
            
        } catch (Exception e) {
            log.error("대기 환전 신청 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 환전 처리 (관리자용)
     */
    @PostMapping("/admin/process")
    public ResponseEntity<?> processExchange(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String adminUserNm = ((com.solsol.heycalendar.security.CustomUserPrincipal) authentication.getPrincipal()).getUserNm();
            // TODO: 관리자 권한 체크 추가
            
            Long exchangeNm = Long.valueOf(request.get("exchangeNm").toString());
            String userNm = (String) request.get("userNm");
            Boolean approved = (Boolean) request.get("approved");
            
            if (exchangeNm == null || userNm == null || approved == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "필수 파라미터가 누락되었습니다"));
            }
            
            exchangeService.processExchange(exchangeNm, userNm, approved, adminUserNm);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", approved ? "환전이 승인되었습니다" : "환전이 거절되었습니다"
            ));
            
        } catch (Exception e) {
            log.error("환전 처리 실패", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
