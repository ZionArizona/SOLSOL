package com.solsol.heycalendar.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {
    
    @Value("${shinhan.api.key:}")
    private String apiKey;
    
    @Value("${shinhan.account.type.unique.no:}")
    private String accountTypeUniqueNo;
    
    private final RestTemplate restTemplate;
    
    private static final String SHINHAN_API_BASE_URL = "https://finopenapi.ssafy.io";
    
    /**
     * 신한은행 API 연결 상태 확인
     */
    @GetMapping("/shinhan")
    public ResponseEntity<Map<String, Object>> checkShinhanApi() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("🔍 신한은행 API 상태 확인 시작");
            
            // 1. 환경변수 설정 확인
            result.put("apiKeyConfigured", apiKey != null && !apiKey.isEmpty());
            result.put("accountTypeConfigured", accountTypeUniqueNo != null && !accountTypeUniqueNo.isEmpty());
            
            // 2. 네트워크 연결 확인 (기본 URL ping)
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    SHINHAN_API_BASE_URL + "/", String.class);
                result.put("networkConnectable", true);
                result.put("networkStatus", response.getStatusCodeValue());
            } catch (Exception e) {
                result.put("networkConnectable", false);
                result.put("networkError", e.getMessage());
                log.warn("❌ 신한은행 API 네트워크 연결 실패: {}", e.getMessage());
            }
            
            // 3. 종합 상태
            boolean isHealthy = (Boolean) result.getOrDefault("apiKeyConfigured", false) && 
                              (Boolean) result.getOrDefault("accountTypeConfigured", false) &&
                              (Boolean) result.getOrDefault("networkConnectable", false);
            
            result.put("status", isHealthy ? "HEALTHY" : "UNHEALTHY");
            result.put("timestamp", java.time.LocalDateTime.now().toString());
            
            log.info("✅ 신한은행 API 상태 확인 완료: {}", result.get("status"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 신한은행 API 상태 확인 중 오류 발생", e);
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            result.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.status(500).body(result);
        }
    }
    
    /**
     * 전체 시스템 헬스체크
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        
        status.put("service", "SOLSOL Backend");
        status.put("timestamp", java.time.LocalDateTime.now().toString());
        status.put("status", "UP");
        
        // 환경변수 설정 현황 (민감정보 제외)
        Map<String, Object> config = new HashMap<>();
        config.put("shinhanApiConfigured", apiKey != null && !apiKey.isEmpty());
        config.put("accountTypeConfigured", accountTypeUniqueNo != null && !accountTypeUniqueNo.isEmpty());
        
        status.put("configuration", config);
        
        return ResponseEntity.ok(status);
    }
}