package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.dto.request.ExchangeApprovalRequest;
import com.solsol.heycalendar.dto.request.ExchangeRequest;
import com.solsol.heycalendar.dto.request.MileageRequest;
import com.solsol.heycalendar.dto.response.ExchangeResponse;
import com.solsol.heycalendar.dto.response.MileageResponse;
import com.solsol.heycalendar.dto.response.UserMileageResponse;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.service.MileageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "마일리지 관리", description = "마일리지 적립 및 교환 관련 API")
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MileageController {

    private final MileageService mileageService;

    @Operation(summary = "현재 사용자 마일리지 내역 조회", description = "로그인한 사용자의 마일리지 적립/사용 내역과 현재 잔액을 조회합니다.")
    @GetMapping("/mileages/my")
    public ResponseEntity<ApiResponse<UserMileageResponse>> getMyMileage(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String userNm = principal.getUserNm();
        log.info("Getting mileage for current user: {}", userNm);
        UserMileageResponse response = mileageService.getUserMileage(userNm);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "사용자 마일리지 내역 조회", description = "특정 사용자의 마일리지 적립/사용 내역과 잘러 잔액을 조회합니다.")
    @GetMapping("/mileages/user/{userNm}")
    public ResponseEntity<UserMileageResponse> getUserMileage(@PathVariable String userNm) {
        log.info("Getting mileage for user: {}", userNm);
        UserMileageResponse response = mileageService.getUserMileage(userNm);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "마일리지 적립", description = "사용자에게 마일리지를 적립해줍니다. (장학금 수혜, 학술활동 참여 등)")
    @PostMapping("/mileages")
    public ResponseEntity<MileageResponse> addMileage(@Valid @RequestBody MileageRequest request) {
        log.info("Adding mileage: {} for user: {}", request.getAmount(), request.getUserNm());
        MileageResponse response = mileageService.addMileage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "전체 마일리지 교환 요청 목록 조회", description = "시스템에 접수된 모든 마일리지 교환 요청을 조회합니다.")
    @GetMapping("/exchanges")
    public ResponseEntity<List<ExchangeResponse>> getAllExchanges() {
        log.info("Getting all exchange requests");
        List<ExchangeResponse> exchanges = mileageService.getAllExchanges();
        return ResponseEntity.ok(exchanges);
    }

    @Operation(summary = "사용자 마일리지 교환 내역 조회", description = "특정 사용자의 마일리지 교환 요청 내역을 조회합니다.")
    @GetMapping("/exchanges/user/{userNm}")
    public ResponseEntity<List<ExchangeResponse>> getUserExchanges(@PathVariable String userNm) {
        log.info("Getting exchanges for user: {}", userNm);
        List<ExchangeResponse> exchanges = mileageService.getUserExchanges(userNm);
        return ResponseEntity.ok(exchanges);
    }

    @Operation(summary = "마일리지 교환 신청", description = "보유한 마일리지를 상품권 등으로 교환을 신청합니다.")
    @PostMapping("/exchanges")
    public ResponseEntity<ExchangeResponse> requestExchange(@Valid @RequestBody ExchangeRequest request) {
        log.info("Processing exchange request: {} mileage for user: {}", request.getAmount(), request.getUserNm());
        ExchangeResponse response = mileageService.requestExchange(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "마일리지 교환 승인", description = "마일리지 교환 요청을 승인 처리합니다.")
    @PutMapping("/exchanges/{exchangeNm}/approve")
    public ResponseEntity<ExchangeResponse> approveExchange(
            @PathVariable String exchangeNm,
            @Valid @RequestBody ExchangeApprovalRequest request) {
        log.info("Approving exchange: {}", exchangeNm);
        ExchangeResponse response = mileageService.approveExchange(exchangeNm, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "마일리지 교환 거부", description = "마일리지 교환 요청을 거부 처리합니다.")
    @PutMapping("/exchanges/{exchangeNm}/reject")
    public ResponseEntity<ExchangeResponse> rejectExchange(
            @PathVariable String exchangeNm,
            @Valid @RequestBody ExchangeApprovalRequest request) {
        log.info("Rejecting exchange: {}", exchangeNm);
        ExchangeResponse response = mileageService.rejectExchange(exchangeNm, request);
        return ResponseEntity.ok(response);
    }
}