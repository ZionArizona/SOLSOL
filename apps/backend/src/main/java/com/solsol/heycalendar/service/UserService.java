package com.solsol.heycalendar.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.dto.request.PasswordChangeRequest;
import com.solsol.heycalendar.dto.request.UserInfoUpdateRequest;
import com.solsol.heycalendar.dto.response.UserInfoResponse;
import com.solsol.heycalendar.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사용자 정보 조회
     */
    public UserInfoResponse getUserInfo(String userId) {
        User user = userMapper.findByUserId(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        return UserInfoResponse.builder()
            .userNm(user.getUserNm())
            .userId(user.getUserId())
            .userName(user.getUserName())
            .accountNm(user.getAccountNm())
            .userMileage(user.getUserMileage()) // 마일리지 필드 추가
            .grade(user.getGrade())
            .gpa(user.getGpa())
            .role(user.getRole() != null ? user.getRole().name() : null)
            .deptNm(user.getDeptNm())
            .collegeNm(user.getCollegeNm())
            .univNm(user.getUnivNm())
            .build();
    }

    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserInfoResponse updateUserInfo(String userId, UserInfoUpdateRequest request) {
        User user = userMapper.findByUserId(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        int updated = userMapper.updateUserInfo(userId, request);
        if (updated != 1) {
            throw new IllegalStateException("Failed to update user info");
        }

        // 수정된 정보 다시 조회해서 반환
        return getUserInfo(userId);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(String userId, PasswordChangeRequest request) {
        User user = userMapper.findByUserId(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // 새 비밀번호 해시화 후 저장
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        int updated = userMapper.updatePasswordByUserId(userId, encodedNewPassword);
        
        if (updated != 1) {
            throw new IllegalStateException("Failed to update password");
        }

        log.info("Password changed for user: {}", userId);
    }
}