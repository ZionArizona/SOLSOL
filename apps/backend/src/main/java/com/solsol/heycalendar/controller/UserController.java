package com.solsol.heycalendar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.dto.request.PasswordChangeRequest;
import com.solsol.heycalendar.dto.request.UserInfoUpdateRequest;
import com.solsol.heycalendar.dto.response.UserInfoResponse;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "사용자 정보 관리", description = "사용자 정보 조회, 수정, 비밀번호 변경 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(
        summary = "내 정보 조회",
        description = "현재 로그인한 사용자의 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getMyInfo(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UserInfoResponse userInfo = userService.getUserInfo(principal.getUserId());
        
        return ResponseEntity.ok(new ApiResponse<>(true, "user info retrieved successfully.", "OK", userInfo));
    }

    @Operation(
        summary = "내 정보 수정",
        description = "사용자의 기본 정보(이름, 학과 등)를 수정합니다."
    )
    @PostMapping("/update")
    public ResponseEntity<ApiResponse<UserInfoResponse>> updateUserInfo(
            @RequestBody UserInfoUpdateRequest request, 
            Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UserInfoResponse updatedInfo = userService.updateUserInfo(principal.getUserId(), request);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "user info updated successfully.", "OK", updatedInfo));
    }

    @Operation(
        summary = "비밀번호 변경",
        description = "현재 비밀번호 확인 후 새 비밀번호로 변경합니다."
    )
    @PostMapping("/password/change")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody PasswordChangeRequest request, 
            Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        userService.changePassword(principal.getUserId(), request);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully.", "OK", null));
    }
}
