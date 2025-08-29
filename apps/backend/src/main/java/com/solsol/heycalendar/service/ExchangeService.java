package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Exchange;
import com.solsol.heycalendar.domain.ExchangeState;
import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.domain.Role;
import com.solsol.heycalendar.mapper.ExchangeMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import com.solsol.heycalendar.service.ShinhanBankService.BalanceInquiryResponse;
import com.solsol.heycalendar.service.ShinhanBankService.TransactionHistoryResponse;
import com.solsol.heycalendar.service.ShinhanBankService.DepositResponse;
import com.solsol.heycalendar.dto.response.UserMileageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ExchangeService {
    
    private final ExchangeMapper exchangeMapper;
    private final UserMapper userMapper;
    private final ShinhanBankService shinhanBankService;
    private final MileageService mileageService;
    private final NotificationService notificationService;
    
    /**
     * 사용자 환전 신청
     */
    public Exchange requestExchange(String userNm, Integer amount) {
        try {
            log.info("💱 환전 신청 요청 - userNm: {}, amount: {}", userNm, amount);
            
            // 사용자 정보 조회
            User user = userMapper.findByUserNm(userNm)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userNm));
            
            // 마일리지 충분한지 확인
            UserMileageResponse userMileage = mileageService.getUserMileage(userNm);
            if (userMileage.getAvailableMileage() < amount) {
                throw new IllegalArgumentException("보유 마일리지가 부족합니다. 보유: " + userMileage.getAvailableMileage() + ", 신청: " + amount);
            }
            
            // 환전 신청 생성
            Exchange exchange = new Exchange();
            exchange.setUserNm(userNm);
            exchange.setAmount(amount);
            exchange.setState(ExchangeState.PENDING);
            exchange.setAppliedAt(LocalDateTime.now());
            
            exchangeMapper.insert(exchange);
            
            log.info("✅ 환전 신청 완료 - userNm: {}, amount: {}, exchangeNm: {}", 
                    userNm, amount, exchange.getExchangeNm());
            
            return exchange;
            
        } catch (Exception e) {
            log.error("❌ 환전 신청 실패 - userNm: {}, amount: {}, error: {}", userNm, amount, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * 관리자 환전 처리 (승인 및 입금)
     */
    public void processExchange(Long exchangeNm, String userNm, boolean approved, String adminUserNm) {
        try {
            log.info("💱 환전 처리 요청 - exchangeNm: {}, userNm: {}, approved: {}, admin: {}", 
                    exchangeNm, userNm, approved, adminUserNm);
            
            // 환전 신청 조회
            Exchange exchange = exchangeMapper.findById(exchangeNm.toString());
            if (exchange == null) {
                throw new IllegalArgumentException("환전 신청을 찾을 수 없습니다: " + exchangeNm);
            }
            
            if (exchange.getState() != ExchangeState.PENDING) {
                throw new IllegalStateException("이미 처리된 환전 신청입니다: " + exchange.getState());
            }
            
            // 사용자 정보 조회
            User user = userMapper.findByUserNm(userNm)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userNm));
            
            if (approved) {
                // 승인 처리
                processApprovedExchange(exchange, user, adminUserNm);
            } else {
                // 거절 처리
                processRejectedExchange(exchange, adminUserNm);
            }
            
        } catch (Exception e) {
            log.error("❌ 환전 처리 실패 - exchangeNm: {}, userNm: {}, error: {}", exchangeNm, userNm, e.getMessage(), e);
            throw e;
        }
    }
    
    private void processApprovedExchange(Exchange exchange, User user, String adminUserNm) {
        try {
            // 1. 마일리지 차감 (실제 차감은 Exchange에 APPROVED 상태로 반영됨)
            UserMileageResponse currentMileage = mileageService.getUserMileage(user.getUserNm());
            log.info("✅ 마일리지 차감 처리 - userNm: {}, 사용 가능: {}, 환전 금액: {}", 
                    user.getUserNm(), currentMileage.getAvailableMileage(), exchange.getAmount());
            
            // 2. 신한은행 계좌 입금
            if (user.getUserKey() != null && user.getAccountNm() != null) {
                DepositResponse depositResponse = shinhanBankService.depositToAccount(
                    user.getUserKey(), 
                    user.getAccountNm(), 
                    exchange.getAmount().longValue(), 
                    "마일리지 환전 - " + exchange.getAmount() + " 포인트"
                );
                log.info("✅ 계좌 입금 완료 - userNm: {}, accountNo: {}, amount: {}", 
                        user.getUserNm(), user.getAccountNm(), exchange.getAmount());
            } else {
                log.warn("⚠️ 사용자 계좌 정보 없음 - userNm: {}", user.getUserNm());
            }
            
            // 3. 환전 상태 업데이트
            exchange.setState(ExchangeState.APPROVED);
            exchange.setProcessedAt(LocalDateTime.now());
            exchangeMapper.update(exchange);
            
            // 4. 알림 발송
            notificationService.sendExchangeCompletedNotification(user.getUserNm(), exchange.getAmount());
            
            log.info("✅ 환전 승인 처리 완료 - exchangeNm: {}, userNm: {}, amount: {}", 
                    exchange.getExchangeNm(), user.getUserNm(), exchange.getAmount());
            
        } catch (Exception e) {
            log.error("❌ 환전 승인 처리 실패 - exchangeNm: {}, error: {}", exchange.getExchangeNm(), e.getMessage(), e);
            throw new RuntimeException("환전 승인 처리에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    private void processRejectedExchange(Exchange exchange, String adminUserNm) {
        try {
            exchange.setState(ExchangeState.REJECTED);
            exchange.setProcessedAt(LocalDateTime.now());
            exchangeMapper.update(exchange);
            
            // 환전 거절 알림 발송
            notificationService.sendExchangeRejectedNotification(exchange.getUserNm(), exchange.getAmount());
            
            log.info("✅ 환전 거절 처리 완료 - exchangeNm: {}, userNm: {}, amount: {}", 
                    exchange.getExchangeNm(), exchange.getUserNm(), exchange.getAmount());
            
        } catch (Exception e) {
            log.error("❌ 환전 거절 처리 실패 - exchangeNm: {}, error: {}", exchange.getExchangeNm(), e.getMessage(), e);
            throw new RuntimeException("환전 거절 처리에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 사용자 환전 내역 조회
     */
    public List<Exchange> getUserExchangeHistory(String userNm) {
        try {
            log.info("💱 환전 내역 조회 - userNm: {}", userNm);
            return exchangeMapper.findByUserNm(userNm);
        } catch (Exception e) {
            log.error("❌ 환전 내역 조회 실패 - userNm: {}, error: {}", userNm, e.getMessage(), e);
            throw new RuntimeException("환전 내역 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 모든 환전 신청 조회 (관리자용)
     */
    public List<Exchange> getAllExchangeRequests() {
        try {
            log.info("💱 전체 환전 신청 조회");
            return exchangeMapper.findAll();
        } catch (Exception e) {
            log.error("❌ 전체 환전 신청 조회 실패 - error: {}", e.getMessage(), e);
            throw new RuntimeException("환전 신청 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 상태별 환전 신청 조회
     */
    public List<Exchange> getExchangeRequestsByState(ExchangeState state) {
        try {
            log.info("💱 상태별 환전 신청 조회 - state: {}", state);
            return exchangeMapper.findByState(state);
        } catch (Exception e) {
            log.error("❌ 상태별 환전 신청 조회 실패 - state: {}, error: {}", state, e.getMessage(), e);
            throw new RuntimeException("환전 신청 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 사용자 계좌 잔액 조회
     */
    public BalanceInquiryResponse getUserAccountBalance(String userNm) {
        try {
            log.info("💰 계좌 잔액 조회 - userNm: {}", userNm);
            
            User user = userMapper.findByUserNm(userNm)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userNm));
            
            if (user.getUserKey() == null || user.getAccountNm() == null) {
                throw new IllegalStateException("사용자 계좌 정보가 없습니다: " + userNm);
            }
            
            return shinhanBankService.inquireAccountBalance(user.getUserKey(), user.getAccountNm());
            
        } catch (Exception e) {
            log.error("❌ 계좌 잔액 조회 실패 - userNm: {}, error: {}", userNm, e.getMessage(), e);
            throw new RuntimeException("계좌 잔액 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 사용자 거래 내역 조회
     */
    public TransactionHistoryResponse getUserTransactionHistory(String userNm, int days) {
        try {
            log.info("💰 거래 내역 조회 - userNm: {}, days: {}", userNm, days);
            
            User user = userMapper.findByUserNm(userNm)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userNm));
            
            if (user.getUserKey() == null || user.getAccountNm() == null) {
                throw new IllegalStateException("사용자 계좌 정보가 없습니다: " + userNm);
            }
            
            String startDate = shinhanBankService.getDateBefore(days);
            String endDate = shinhanBankService.getTodayString();
            
            return shinhanBankService.inquireTransactionHistory(
                user.getUserKey(), 
                user.getAccountNm(), 
                startDate, 
                endDate, 
                "A" // 전체 거래
            );
            
        } catch (Exception e) {
            log.error("❌ 거래 내역 조회 실패 - userNm: {}, error: {}", userNm, e.getMessage(), e);
            throw new RuntimeException("거래 내역 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 같은 대학 사용자들의 마일리지 조회 (관리자용)
     */
    public Map<String, Object> getUniversityUsersMileage(String adminUserNm) {
        try {
            log.info("🎓 대학 사용자 마일리지 조회 - adminUserNm: {}", adminUserNm);
            
            // 관리자 정보 조회
            User admin = userMapper.findByUserNm(adminUserNm)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다: " + adminUserNm));
            
            // 같은 대학의 사용자들 조회 - 현재는 모든 활성 사용자 조회
            // TODO: 대학별 필터링 기능 추가 필요
            List<String> allUserNames = userMapper.findAllActiveUserNames();
            
            // 각 사용자의 마일리지 정보 조회 (user.userMileage 직접 사용)
            List<Map<String, Object>> userMileages = new ArrayList<>();
            for (String userNm : allUserNames) {
                try {
                    User user = userMapper.findByUserNm(userNm).orElse(null);
                    if (user != null) {
                        log.info("🔍 사용자 정보 확인 - userNm: {}, univNm: {}, role: {}, admin univNm: {}", 
                                userNm, user.getUnivNm(), user.getRole(), admin.getUnivNm());
                    }
                    // STUDENT 역할 체크 및 대학 필터링 (999번 대학은 모든 사용자 처리 가능)
                    if (user != null && user.getRole() != null && user.getRole().toString().equals("STUDENT")
                        && (admin.getUnivNm() == null || admin.getUnivNm().equals(999) || user.getUnivNm() == null || user.getUnivNm().equals(admin.getUnivNm()))) {
                        // 환전 대기 중인 마일리지 계산
                        List<Exchange> pendingExchanges = exchangeMapper.findByUserNmAndState(userNm, ExchangeState.PENDING);
                        Integer pendingAmount = pendingExchanges.stream()
                                .mapToInt(Exchange::getAmount)
                                .sum();
                        
                        // 사용자의 총 마일리지 (user.userMileage 컬럼에서 조회)
                        Integer totalMileage = user.getUserMileage() != null ? user.getUserMileage() : 0;
                        Integer availableMileage = Math.max(0, totalMileage - pendingAmount);
                        
                        Map<String, Object> userInfo = new HashMap<>();
                        userInfo.put("userNm", user.getUserNm());
                        userInfo.put("userName", user.getUserName());
                        userInfo.put("userId", user.getUserId());
                        userInfo.put("totalMileage", totalMileage);
                        userInfo.put("availableMileage", availableMileage);
                        userInfo.put("pendingExchange", pendingAmount);
                        
                        userMileages.add(userInfo);
                    }
                } catch (Exception e) {
                    log.warn("사용자 정보 조회 실패: {}", userNm, e);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("universityNm", admin.getUnivNm());
            result.put("users", userMileages);
            result.put("totalUsers", userMileages.size());
            
            return result;
            
        } catch (Exception e) {
            log.error("❌ 대학 사용자 마일리지 조회 실패 - adminUserNm: {}, error: {}", adminUserNm, e.getMessage(), e);
            throw new RuntimeException("대학 사용자 마일리지 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 마일리지를 돈으로 환전 처리 (관리자용)
     */
    public void convertMileageToMoney(String targetUserNm, Integer mileageAmount, String adminUserNm) {
        try {
            log.info("💱 마일리지 환전 처리 - targetUserNm: {}, amount: {}, admin: {}", 
                    targetUserNm, mileageAmount, adminUserNm);
            
            // 대상 사용자 정보 조회
            User targetUser = userMapper.findByUserNm(targetUserNm)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + targetUserNm));
            
            log.info("🔍 대상 사용자 정보 - userNm: {}, userKey: {}, accountNm: {}, mileage: {}", 
                    targetUser.getUserNm(), 
                    targetUser.getUserKey() != null ? "존재" : "없음",
                    targetUser.getAccountNm() != null ? targetUser.getAccountNm() : "없음",
                    targetUser.getUserMileage());
            
            // 관리자 정보 조회 (권한 확인용) - 선택적으로 처리
            User admin = null;
            if (adminUserNm != null) {
                admin = userMapper.findByUserNm(adminUserNm).orElse(null);
                if (admin == null) {
                    log.warn("⚠️ 관리자를 찾을 수 없음 - adminUserNm: {}", adminUserNm);
                }
            }
            
            // 같은 대학인지 확인 (univNm 사용) - admin이 존재할 때만
            // 999번 대학(미지정대학교)은 모든 사용자 처리 가능
            if (admin != null && targetUser.getUnivNm() != null && admin.getUnivNm() != null 
                && !admin.getUnivNm().equals(999) && !targetUser.getUnivNm().equals(admin.getUnivNm())) {
                throw new IllegalArgumentException("다른 대학의 사용자는 처리할 수 없습니다");
            }
            
            // 마일리지 충분한지 확인 (user.userMileage에서 직접 조회)
            Integer currentMileage = targetUser.getUserMileage() != null ? targetUser.getUserMileage() : 0;
            if (currentMileage < mileageAmount) {
                throw new IllegalArgumentException("보유 마일리지가 부족합니다. 보유: " + currentMileage + ", 신청: " + mileageAmount);
            }
            
            // 환전 신청 생성 및 자동 승인
            Exchange exchange = new Exchange();
            // exchangeNm 생성 (bigint 타입으로 - 숫자만 사용)
            String exchangeNm = String.valueOf(System.currentTimeMillis() % 10000000000L);
            exchange.setExchangeNm(exchangeNm);
            exchange.setUserNm(targetUserNm);
            exchange.setAmount(mileageAmount);
            exchange.setState(ExchangeState.APPROVED);
            exchange.setAppliedAt(LocalDateTime.now());
            exchange.setProcessedAt(LocalDateTime.now());
            
            exchangeMapper.insert(exchange);
            
            // 사용자 마일리지에서 차감
            Integer newMileage = currentMileage - mileageAmount;
            userMapper.updateUserMileage(targetUserNm, newMileage);
            log.info("✅ 사용자 마일리지 차감 완료 - userNm: {}, 기존: {}P, 차감: {}P, 잔여: {}P", 
                    targetUserNm, currentMileage, mileageAmount, newMileage);
            
            // 계좌 입금 처리
            if (targetUser.getUserKey() != null && targetUser.getAccountNm() != null) {
                log.info("🏦 신한은행 API 호출 시작 - userKey: {}, accountNm: {}, amount: {}", 
                        targetUser.getUserKey().substring(0, Math.min(10, targetUser.getUserKey().length())) + "***",
                        targetUser.getAccountNm(), mileageAmount);
                
                DepositResponse depositResponse = shinhanBankService.depositToAccount(
                    targetUser.getUserKey(), 
                    targetUser.getAccountNm(), 
                    mileageAmount.longValue(), 
                    "마일리지 환전 (관리자 처리) - " + mileageAmount + " 포인트"
                );
                log.info("✅ 계좌 입금 완료 - userNm: {}, accountNo: {}, amount: {}", 
                        targetUserNm, targetUser.getAccountNm(), mileageAmount);
            } else {
                log.error("❌ 계좌 정보 부족 - userKey: {}, accountNm: {}", 
                        targetUser.getUserKey() != null ? "존재" : "없음",
                        targetUser.getAccountNm() != null ? targetUser.getAccountNm() : "없음");
                throw new IllegalArgumentException("사용자의 계좌 정보가 없습니다. 계좌 연동을 먼저 해주세요.");
            }
            
            // 알림 발송
            notificationService.sendExchangeCompletedNotification(targetUserNm, mileageAmount);
            
            log.info("✅ 마일리지 환전 처리 완료 - targetUserNm: {}, amount: {}", targetUserNm, mileageAmount);
            
        } catch (Exception e) {
            log.error("❌ 마일리지 환전 처리 실패 - targetUserNm: {}, error: {}", targetUserNm, e.getMessage(), e);
            throw new RuntimeException("마일리지 환전 처리에 실패했습니다: " + e.getMessage(), e);
        }
    }
}