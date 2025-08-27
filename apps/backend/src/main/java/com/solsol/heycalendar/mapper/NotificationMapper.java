package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.Notification;
import com.solsol.heycalendar.domain.NotificationType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    
    // 알림 생성
    void insert(Notification notification);
    
    // 사용자별 알림 조회
    List<Notification> findByUser(@Param("userNm") String userNm);
    
    // 사용자별 타입별 알림 조회
    List<Notification> findByUserAndType(@Param("userNm") String userNm, @Param("type") NotificationType type);
    
    // 읽지 않은 알림 조회
    List<Notification> findUnreadByUser(@Param("userNm") String userNm);
    
    // 알림 읽음 처리
    void markAsRead(@Param("id") Long id);
    
    // 모든 알림 읽음 처리
    void markAllAsReadByUser(@Param("userNm") String userNm);
    
    // 읽지 않은 알림 개수
    int countUnreadByUser(@Param("userNm") String userNm);
    
    // 알림 삭제
    void delete(@Param("id") Long id);
}