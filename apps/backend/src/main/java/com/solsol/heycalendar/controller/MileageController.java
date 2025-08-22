package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.dto.request.ExchangeApprovalRequest;
import com.solsol.heycalendar.dto.request.ExchangeRequest;
import com.solsol.heycalendar.dto.request.MileageRequest;
import com.solsol.heycalendar.dto.response.ExchangeResponse;
import com.solsol.heycalendar.dto.response.MileageResponse;
import com.solsol.heycalendar.dto.response.UserMileageResponse;
import com.solsol.heycalendar.service.MileageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Mileage and Exchange management controller
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MileageController {

    private final MileageService mileageService;

    /**
     * Get user's mileage history
     *
     * @param userNm User name
     * @return User mileage response with history
     */
    @GetMapping("/mileages/user/{userNm}")
    public ResponseEntity<UserMileageResponse> getUserMileage(@PathVariable String userNm) {
        log.info("Getting mileage for user: {}", userNm);
        UserMileageResponse response = mileageService.getUserMileage(userNm);
        return ResponseEntity.ok(response);
    }

    /**
     * Add mileage to user
     *
     * @param request Mileage request
     * @return Created mileage response
     */
    @PostMapping("/mileages")
    public ResponseEntity<MileageResponse> addMileage(@Valid @RequestBody MileageRequest request) {
        log.info("Adding mileage: {} for user: {}", request.getAmount(), request.getUserNm());
        MileageResponse response = mileageService.addMileage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List all exchange requests
     *
     * @return List of all exchange requests
     */
    @GetMapping("/exchanges")
    public ResponseEntity<List<ExchangeResponse>> getAllExchanges() {
        log.info("Getting all exchange requests");
        List<ExchangeResponse> exchanges = mileageService.getAllExchanges();
        return ResponseEntity.ok(exchanges);
    }

    /**
     * Get user's exchange history
     *
     * @param userNm User name
     * @return List of user's exchange requests
     */
    @GetMapping("/exchanges/user/{userNm}")
    public ResponseEntity<List<ExchangeResponse>> getUserExchanges(@PathVariable String userNm) {
        log.info("Getting exchanges for user: {}", userNm);
        List<ExchangeResponse> exchanges = mileageService.getUserExchanges(userNm);
        return ResponseEntity.ok(exchanges);
    }

    /**
     * Request mileage exchange
     *
     * @param request Exchange request
     * @return Created exchange response
     */
    @PostMapping("/exchanges")
    public ResponseEntity<ExchangeResponse> requestExchange(@Valid @RequestBody ExchangeRequest request) {
        log.info("Processing exchange request: {} mileage for user: {}", request.getAmount(), request.getUserNm());
        ExchangeResponse response = mileageService.requestExchange(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Approve exchange request
     *
     * @param exchangeNm Exchange ID
     * @param request Approval request
     * @return Updated exchange response
     */
    @PutMapping("/exchanges/{exchangeNm}/approve")
    public ResponseEntity<ExchangeResponse> approveExchange(
            @PathVariable String exchangeNm,
            @Valid @RequestBody ExchangeApprovalRequest request) {
        log.info("Approving exchange: {}", exchangeNm);
        ExchangeResponse response = mileageService.approveExchange(exchangeNm, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Reject exchange request
     *
     * @param exchangeNm Exchange ID
     * @param request Rejection request
     * @return Updated exchange response
     */
    @PutMapping("/exchanges/{exchangeNm}/reject")
    public ResponseEntity<ExchangeResponse> rejectExchange(
            @PathVariable String exchangeNm,
            @Valid @RequestBody ExchangeApprovalRequest request) {
        log.info("Rejecting exchange: {}", exchangeNm);
        ExchangeResponse response = mileageService.rejectExchange(exchangeNm, request);
        return ResponseEntity.ok(response);
    }
}