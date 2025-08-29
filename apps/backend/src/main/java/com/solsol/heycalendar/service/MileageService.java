package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Exchange;
import com.solsol.heycalendar.domain.ExchangeState;
import com.solsol.heycalendar.domain.Mileage;
import com.solsol.heycalendar.dto.request.ExchangeApprovalRequest;
import com.solsol.heycalendar.dto.request.ExchangeRequest;
import com.solsol.heycalendar.dto.request.MileageRequest;
import com.solsol.heycalendar.dto.response.ExchangeResponse;
import com.solsol.heycalendar.dto.response.MileageResponse;
import com.solsol.heycalendar.dto.response.UserMileageResponse;
import com.solsol.heycalendar.mapper.ExchangeMapper;
import com.solsol.heycalendar.mapper.MileageMapper;
import com.solsol.heycalendar.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mileage and Exchange business logic service
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MileageService {

    private final MileageMapper mileageMapper;
    private final ExchangeMapper exchangeMapper;
    private final UserMapper userMapper;

    /**
     * Get user's complete mileage information
     *
     * @param userNm User name
     * @return User mileage response with balances and history
     */
    public UserMileageResponse getUserMileage(String userNm) {
        List<Mileage> mileageHistory = mileageMapper.findByUserNm(userNm);
        List<Exchange> exchangeHistory = exchangeMapper.findByUserNm(userNm);
        
        Integer totalMileage = calculateTotalMileage(mileageHistory);
        Integer pendingExchange = calculatePendingExchange(exchangeHistory);
        Integer approvedExchange = calculateApprovedExchange(exchangeHistory);
        Integer availableMileage = totalMileage - pendingExchange - approvedExchange;

        return UserMileageResponse.builder()
                .userNm(userNm)
                .totalMileage(totalMileage)
                .availableMileage(Math.max(0, availableMileage))
                .pendingExchange(pendingExchange)
                .mileageHistory(convertMileageToResponse(mileageHistory))
                .exchangeHistory(convertExchangeToResponse(exchangeHistory))
                .build();
    }

    /**
     * Add mileage to user
     *
     * @param request Mileage request
     * @return Created mileage response
     */
    @Transactional
    public MileageResponse addMileage(MileageRequest request) {
        userMapper.addUserMileage(request.getUserNm(), request.getAmount());
        log.info("Added {} mileage to user: {}", request.getAmount(), request.getUserNm());

        Mileage mileage = Mileage.builder()
                .userNm(request.getUserNm())
                .amount(request.getAmount())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        return convertMileageToResponse(mileage);
    }

    /**
     * Get all exchange requests
     *
     * @return List of all exchange requests
     */
    public List<ExchangeResponse> getAllExchanges() {
        List<Exchange> exchanges = exchangeMapper.findAll();
        return convertExchangeToResponse(exchanges);
    }

    /**
     * Get user's exchange history
     *
     * @param userNm User name
     * @return List of user's exchange requests
     */
    public List<ExchangeResponse> getUserExchanges(String userNm) {
        List<Exchange> exchanges = exchangeMapper.findByUserNm(userNm);
        return convertExchangeToResponse(exchanges);
    }

    /**
     * Request mileage exchange
     *
     * @param request Exchange request
     * @return Created exchange response
     */
    @Transactional
    public ExchangeResponse requestExchange(ExchangeRequest request) {
        // Validate user has enough available mileage
        UserMileageResponse userMileage = getUserMileage(request.getUserNm());
        if (userMileage.getAvailableMileage() < request.getAmount()) {
            throw new IllegalArgumentException(
                String.format("Insufficient mileage. Available: %d, Requested: %d", 
                    userMileage.getAvailableMileage(), request.getAmount())
            );
        }

        String exchangeNm = generateExchangeId();
        Exchange exchange = Exchange.builder()
                .exchangeNm(exchangeNm)
                .userNm(request.getUserNm())
                .amount(request.getAmount())
                .state(ExchangeState.PENDING)
                .reason(request.getReason())
                .appliedAt(LocalDateTime.now())
                .build();

        exchangeMapper.insert(exchange);
        log.info("Created exchange request: {} for {} mileage by user: {}", 
            exchangeNm, request.getAmount(), request.getUserNm());

        return convertExchangeToResponse(exchange);
    }

    /**
     * Approve exchange request
     *
     * @param exchangeNm Exchange ID
     * @param request Approval request
     * @return Updated exchange response
     */
    @Transactional
    public ExchangeResponse approveExchange(String exchangeNm, ExchangeApprovalRequest request) {
        Exchange exchange = exchangeMapper.findById(exchangeNm);
        if (exchange == null) {
            throw new IllegalArgumentException("Exchange not found: " + exchangeNm);
        }

        if (exchange.getState() != ExchangeState.PENDING) {
            throw new IllegalArgumentException("Exchange is not in pending state: " + exchangeNm);
        }

        // Validate user still has enough mileage
        UserMileageResponse userMileage = getUserMileage(exchange.getUserNm());
        if (userMileage.getAvailableMileage() + exchange.getAmount() < exchange.getAmount()) {
            throw new IllegalArgumentException("User no longer has sufficient mileage for this exchange");
        }

        exchange.setState(ExchangeState.APPROVED);
        exchange.setProcessedAt(LocalDateTime.now());
        if (request.getReason() != null) {
            exchange.setReason(request.getReason());
        }

        exchangeMapper.update(exchange);
        log.info("Approved exchange: {} for user: {}", exchangeNm, exchange.getUserNm());

        return convertExchangeToResponse(exchange);
    }

    /**
     * Reject exchange request
     *
     * @param exchangeNm Exchange ID
     * @param request Rejection request
     * @return Updated exchange response
     */
    @Transactional
    public ExchangeResponse rejectExchange(String exchangeNm, ExchangeApprovalRequest request) {
        Exchange exchange = exchangeMapper.findById(exchangeNm);
        if (exchange == null) {
            throw new IllegalArgumentException("Exchange not found: " + exchangeNm);
        }

        if (exchange.getState() != ExchangeState.PENDING) {
            throw new IllegalArgumentException("Exchange is not in pending state: " + exchangeNm);
        }

        exchange.setState(ExchangeState.REJECTED);
        exchange.setProcessedAt(LocalDateTime.now());
        if (request.getReason() != null) {
            exchange.setReason(request.getReason());
        }

        exchangeMapper.update(exchange);
        log.info("Rejected exchange: {} for user: {}", exchangeNm, exchange.getUserNm());

        return convertExchangeToResponse(exchange);
    }

    // Private helper methods

    private Integer calculateTotalMileage(List<Mileage> mileageHistory) {
        return mileageHistory.stream()
                .mapToInt(Mileage::getAmount)
                .sum();
    }

    private Integer calculatePendingExchange(List<Exchange> exchangeHistory) {
        return exchangeHistory.stream()
                .filter(exchange -> exchange.getState() == ExchangeState.PENDING)
                .mapToInt(Exchange::getAmount)
                .sum();
    }

    private Integer calculateApprovedExchange(List<Exchange> exchangeHistory) {
        return exchangeHistory.stream()
                .filter(exchange -> exchange.getState() == ExchangeState.APPROVED)
                .mapToInt(Exchange::getAmount)
                .sum();
    }

    private List<MileageResponse> convertMileageToResponse(List<Mileage> mileages) {
        return mileages.stream()
                .map(this::convertMileageToResponse)
                .collect(Collectors.toList());
    }

    private MileageResponse convertMileageToResponse(Mileage mileage) {
        return MileageResponse.builder()
                .key(mileage.getKey())
                .userNm(mileage.getUserNm())
                .amount(mileage.getAmount())
                .createdAt(mileage.getCreatedAt())
                .description(mileage.getDescription())
                .build();
    }

    private List<ExchangeResponse> convertExchangeToResponse(List<Exchange> exchanges) {
        return exchanges.stream()
                .map(this::convertExchangeToResponse)
                .collect(Collectors.toList());
    }

    private ExchangeResponse convertExchangeToResponse(Exchange exchange) {
        return ExchangeResponse.builder()
                .exchangeNm(exchange.getExchangeNm())
                .userNm(exchange.getUserNm())
                .amount(exchange.getAmount())
                .state(exchange.getState())
                .appliedAt(exchange.getAppliedAt())
                .processedAt(exchange.getProcessedAt())
                .reason(exchange.getReason())
                .build();
    }

    private String generateExchangeId() {
        return "EX" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}