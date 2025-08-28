package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Notification;
import com.solsol.heycalendar.domain.NotificationType;
import com.solsol.heycalendar.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 알림 생성
     */
    @Transactional
    public void createNotification(String userNm, NotificationType type, String title, 
                                 String message, Long relatedId, String actionRoute) {
        log.info("Creating notification - userNm: {}, type: {}, title: {}", userNm, type, title);
        
        Notification notification = Notification.builder()
                .userNm(userNm)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .isRead(false)
                .actionRoute(actionRoute)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        notificationMapper.insert(notification);
        log.info("Notification created successfully - userNm: {}, type: {}", userNm, type);
        
        // WebSocket을 통해 실시간 알림 전송
        log.info("About to send realtime notification for user: {}", userNm);
        sendRealtimeNotification(userNm, notification);
        log.info("Realtime notification sending completed for user: {}", userNm);
    }

    /**
     * 장학금 선정 결과 알림 생성
     */
    @Transactional
    public void createScholarshipResultNotification(String userNm, Long scholarshipId, 
                                                   String scholarshipName, boolean isSelected) {
        String title = isSelected ? "장학금 선정 결과 발표" : "장학금 선정 결과 발표";
        String message = isSelected ? 
            String.format("축하합니다! '%s' 장학금에 선정되셨습니다.", scholarshipName) :
            String.format("'%s' 장학금 선정에서 아쉽게 탈락하셨습니다. 다음 기회를 위해 준비해보세요.", scholarshipName);
        String actionRoute = "/MyScholarship/MyScholarship";
        
        createNotification(userNm, NotificationType.SCHOLARSHIP_RESULT, title, message, scholarshipId, actionRoute);
    }

    /**
     * 마감임박 알림 생성 (오늘 중복 체크 포함)
     */
    @Transactional
    public void createDeadlineReminderNotification(String userNm, Long scholarshipId, 
                                                  String scholarshipName, int daysLeft) {
        // 오늘 날짜로 마감임박 알림이 이미 생성되었는지 체크
        // 같은 장학금에 대해 하루에 여러번 마감임박 알림이 생성되는 것을 방지
        if (isDuplicateDeadlineReminder(userNm, scholarshipId)) {
            log.debug("오늘 이미 생성된 마감임박 알림 - 사용자: {}, 장학금ID: {}", userNm, scholarshipId);
            return;
        }
        
        String title = "신청 마감 임박";
        String message = String.format("찜한 '%s' 신청 마감까지 %d일 남았습니다.", scholarshipName, daysLeft);
        String actionRoute = String.format("/Scholarship/ScholarshipDetail?id=%d", scholarshipId);
        
        createNotification(userNm, NotificationType.DEADLINE_REMINDER, title, message, scholarshipId, actionRoute);
    }
    
    /**
     * 오늘 이미 해당 장학금에 대한 마감임박 알림이 생성되었는지 체크
     */
    private boolean isDuplicateDeadlineReminder(String userNm, Long scholarshipId) {
        return notificationMapper.existsByUserAndTypeAndRelatedIdToday(userNm, NotificationType.DEADLINE_REMINDER, scholarshipId);
    }

    /**
     * 새로운 장학금 알림 생성 (중복 체크 포함)
     */
    @Transactional
    public void createNewScholarshipNotification(String userNm, Long scholarshipId, 
                                               String scholarshipName, int amount) {
        // 중복 알림 체크
        if (notificationMapper.existsByUserAndTypeAndRelatedId(userNm, NotificationType.NEW_SCHOLARSHIP, scholarshipId)) {
            log.debug("이미 존재하는 새 장학금 알림 - 사용자: {}, 장학금ID: {}", userNm, scholarshipId);
            return;
        }
        
        String title = "새로운 장학금이 등록되었습니다";
        String message = String.format("%s (%d만원)이 새로 등록되었습니다. 지금 신청해보세요!", 
                                      scholarshipName, amount / 10000);
        String actionRoute = String.format("/Scholarship/ScholarshipDetail?id=%d", scholarshipId);
        
        createNotification(userNm, NotificationType.NEW_SCHOLARSHIP, title, message, scholarshipId, actionRoute);
    }

    /**
     * 사용자별 알림 조회
     */
    public List<Notification> getUserNotifications(String userNm) {
        return notificationMapper.findByUser(userNm);
    }

    /**
     * 사용자별 타입별 알림 조회
     */
    public List<Notification> getUserNotificationsByType(String userNm, NotificationType type) {
        return notificationMapper.findByUserAndType(userNm, type);
    }

    /**
     * 읽지 않은 알림 조회
     */
    public List<Notification> getUnreadNotifications(String userNm) {
        return notificationMapper.findUnreadByUser(userNm);
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        log.info("Marking notification as read - id: {}", notificationId);
        notificationMapper.markAsRead(notificationId);
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllAsRead(String userNm) {
        log.info("Marking all notifications as read for user: {}", userNm);
        notificationMapper.markAllAsReadByUser(userNm);
    }

    /**
     * 읽지 않은 알림 개수
     */
    public int getUnreadCount(String userNm) {
        return notificationMapper.countUnreadByUser(userNm);
    }

    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification - id: {}", notificationId);
        notificationMapper.delete(notificationId);
    }
    
    /**
     * WebSocket을 통한 실시간 알림 전송
     */
    private void sendRealtimeNotification(String userNm, Notification notification) {
        log.info("Starting sendRealtimeNotification for user: {}, messagingTemplate: {}", userNm, messagingTemplate != null ? "AVAILABLE" : "NULL");
        
        try {
            // 사용자별 개인 큐로 알림 전송
            String destination = "/queue/notifications/" + userNm;
            log.info("Sending notification to destination: {}", destination);
            messagingTemplate.convertAndSend(destination, notification);
            log.info("✅ Realtime notification sent to user: {} at destination: {}", userNm, destination);
            
            // 전체 토픽으로도 전송 (선택적)
            if (notification.getType() == NotificationType.NEW_SCHOLARSHIP) {
                log.info("Broadcasting new scholarship notification to all users");
                messagingTemplate.convertAndSend("/topic/new-scholarships", notification);
                log.info("✅ New scholarship notification broadcasted to all users");
            }
        } catch (Exception e) {
            log.error("❌ Failed to send realtime notification to user: {}", userNm, e);
            // 실시간 알림 실패해도 DB 저장은 성공했으므로 예외를 던지지 않음
        }
        
        log.info("Completed sendRealtimeNotification for user: {}", userNm);
    }
    
    /**
     * 모든 사용자에게 브로드캐스트 알림 전송
     */
    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcast notification sent to all users");
        } catch (Exception e) {
            log.error("Failed to broadcast notification", e);
        }
    }
}