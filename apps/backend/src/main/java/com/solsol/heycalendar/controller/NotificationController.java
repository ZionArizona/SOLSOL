package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.domain.Notification;
import com.solsol.heycalendar.domain.NotificationType;
import com.solsol.heycalendar.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;

    /**
     * 사용자의 모든 알림 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            List<Notification> notifications = notificationService.getUserNotifications(userNm);
            return ResponseEntity.ok(ApiResponse.success("알림 조회 성공", notifications));
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 타입별 알림 조회
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotificationsByType(
            @PathVariable NotificationType type,
            Authentication authentication) {
        try {
            String userNm = authentication.getName();
            List<Notification> notifications = notificationService.getUserNotificationsByType(userNm, type);
            return ResponseEntity.ok(ApiResponse.success("타입별 알림 조회 성공", notifications));
        } catch (Exception e) {
            log.error("Error getting notifications by type", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "타입별 알림 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 읽지 않은 알림 조회
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            List<Notification> notifications = notificationService.getUnreadNotifications(userNm);
            return ResponseEntity.ok(ApiResponse.success("읽지 않은 알림 조회 성공", notifications));
        } catch (Exception e) {
            log.error("Error getting unread notifications", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "읽지 않은 알림 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 읽지 않은 알림 개수 조회
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            int count = notificationService.getUnreadCount(userNm);
            return ResponseEntity.ok(ApiResponse.success("읽지 않은 알림 개수 조회 성공", count));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "읽지 않은 알림 개수 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 알림 읽음 처리
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(ApiResponse.success("알림을 읽음 처리했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 읽음 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 모든 알림 읽음 처리
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            notificationService.markAllAsRead(userNm);
            return ResponseEntity.ok(ApiResponse.success("모든 알림을 읽음 처리했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 일괄 읽음 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 알림 삭제
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(
            @PathVariable Long notificationId,
            Authentication authentication) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(ApiResponse.success("알림을 삭제했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 삭제 중 오류가 발생했습니다."));
        }
    }

    /**
     * 장학금 선정 결과 알림 생성 (관리자용)
     */
    @PostMapping("/scholarship-result")
    public ResponseEntity<ApiResponse<String>> createScholarshipResultNotification(
            @RequestParam String targetUserNm,
            @RequestParam Long scholarshipId,
            @RequestParam String scholarshipName,
            @RequestParam boolean isSelected) {
        try {
            notificationService.createScholarshipResultNotification(targetUserNm, scholarshipId, scholarshipName, isSelected);
            return ResponseEntity.ok(ApiResponse.success("장학금 선정 결과 알림을 생성했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error creating scholarship result notification", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 생성 중 오류가 발생했습니다."));
        }
    }

    /**
     * 마감임박 알림 생성 (스케줄러용)
     */
    @PostMapping("/deadline-reminder")
    public ResponseEntity<ApiResponse<String>> createDeadlineReminderNotification(
            @RequestParam String targetUserNm,
            @RequestParam Long scholarshipId,
            @RequestParam String scholarshipName,
            @RequestParam int daysLeft) {
        try {
            notificationService.createDeadlineReminderNotification(targetUserNm, scholarshipId, scholarshipName, daysLeft);
            return ResponseEntity.ok(ApiResponse.success("마감임박 알림을 생성했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error creating deadline reminder notification", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 생성 중 오류가 발생했습니다."));
        }
    }

    /**
     * 새로운 장학금 알림 생성 (관리자용)
     */
    @PostMapping("/new-scholarship")
    public ResponseEntity<ApiResponse<String>> createNewScholarshipNotification(
            @RequestParam String targetUserNm,
            @RequestParam Long scholarshipId,
            @RequestParam String scholarshipName,
            @RequestParam int amount) {
        try {
            notificationService.createNewScholarshipNotification(targetUserNm, scholarshipId, scholarshipName, amount);
            return ResponseEntity.ok(ApiResponse.success("새로운 장학금 알림을 생성했습니다.", "SUCCESS"));
        } catch (Exception e) {
            log.error("Error creating new scholarship notification", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("NOTIFICATION_ERROR", "알림 생성 중 오류가 발생했습니다."));
        }
    }
}