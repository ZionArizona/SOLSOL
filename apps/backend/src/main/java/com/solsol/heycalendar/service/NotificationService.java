package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Notification;
import com.solsol.heycalendar.domain.NotificationType;
import com.solsol.heycalendar.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationMapper notificationMapper;

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
     * 마감임박 알림 생성
     */
    @Transactional
    public void createDeadlineReminderNotification(String userNm, Long scholarshipId, 
                                                  String scholarshipName, int daysLeft) {
        String title = "신청 마감 임박";
        String message = String.format("찜한 '%s' 신청 마감까지 %d일 남았습니다.", scholarshipName, daysLeft);
        String actionRoute = String.format("/Scholarship/ScholarshipDetail?id=%d", scholarshipId);
        
        createNotification(userNm, NotificationType.DEADLINE_REMINDER, title, message, scholarshipId, actionRoute);
    }

    /**
     * 새로운 장학금 알림 생성
     */
    @Transactional
    public void createNewScholarshipNotification(String userNm, Long scholarshipId, 
                                               String scholarshipName, int amount) {
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
}