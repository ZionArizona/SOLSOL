package com.solsol.heycalendar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.mapper.ScholarshipMapper;
import com.solsol.heycalendar.mapper.ScholarshipBookmarkMapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeadlineReminderService {

    private final ScholarshipMapper scholarshipMapper;
    private final ScholarshipBookmarkMapper scholarshipBookmarkMapper;
    private final NotificationService notificationService;

    /**
     * 매일 오전 9시에 마감임박 장학금 체크 및 알림 전송
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void checkDeadlineReminders() {
        log.info("마감임박 알림 체크 시작");
        
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        
        try {
            // 내일 마감되는 장학금 조회 (1일 전 알림)
            List<Scholarship> upcomingDeadlines = scholarshipMapper.findScholarshipsEndingOn(tomorrow);
            
            log.info("내일 마감 장학금 수: {}", upcomingDeadlines.size());
            
            for (Scholarship scholarship : upcomingDeadlines) {
                // 해당 장학금을 찜한 사용자들에게 알림 전송
                sendDeadlineRemindersForScholarship(scholarship);
            }
            
        } catch (Exception e) {
            log.error("마감임박 알림 체크 중 오류 발생", e);
        }
        
        log.info("마감임박 알림 체크 완료");
    }

    /**
     * 특정 장학금을 찜한 사용자들에게 마감임박 알림 전송
     */
    private void sendDeadlineRemindersForScholarship(Scholarship scholarship) {
        try {
            // 해당 장학금을 찜한 사용자들 조회
            List<ScholarshipBookmark> bookmarks = scholarshipBookmarkMapper.findByScholarshipId(scholarship.getId());
            
            log.info("장학금 '{}' - 찜한 사용자 수: {}", scholarship.getScholarshipName(), bookmarks.size());
            
            for (ScholarshipBookmark bookmark : bookmarks) {
                // 각 사용자에게 마감임박 알림 전송 (1일 전)
                notificationService.createDeadlineReminderNotification(
                    bookmark.getUserNm(),
                    scholarship.getId(),
                    scholarship.getScholarshipName(),
                    1
                );
            }
            
            log.info("장학금 '{}' 마감임박 알림 전송 완료 - 대상: {}명", 
                scholarship.getScholarshipName(), bookmarks.size());
                
        } catch (Exception e) {
            log.error("장학금 '{}'에 대한 마감임박 알림 전송 실패", scholarship.getScholarshipName(), e);
        }
    }

    /**
     * 수동으로 마감임박 알림 체크 (테스트용)
     */
    public void manualCheckDeadlineReminders() {
        log.info("수동 마감임박 알림 체크 시작");
        checkDeadlineReminders();
    }
}