package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.mapper.ScholarshipMapper;
import com.solsol.heycalendar.mapper.ScholarshipBookmarkMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {
    
    private final ScholarshipMapper scholarshipMapper;
    private final ScholarshipBookmarkMapper scholarshipBookmarkMapper;
    private final NotificationService notificationService;

    /**
     * 매일 오전 9시에 마감임박 알림을 확인하고 생성합니다.
     * 마감 3일, 1일 전에 알림을 보냅니다.
     */
    @Scheduled(cron = "0 0 9 * * *") // 매일 오전 9시
    public void checkDeadlineReminders() {
        log.info("마감임박 알림 체크 시작");
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate threeDaysLater = today.plusDays(3);
            LocalDate oneDayLater = today.plusDays(1);
            
            // 마감이 3일 또는 1일 남은 장학금들 조회
            List<Scholarship> scholarshipsEndingSoon = scholarshipMapper.findScholarshipsEndingBetween(
                today.toString(), 
                threeDaysLater.toString()
            );
            
            for (Scholarship scholarship : scholarshipsEndingSoon) {
                LocalDate endDate = scholarship.getRecruitmentEndDate();
                long daysUntilDeadline = ChronoUnit.DAYS.between(today, endDate);
                
                // 3일 전이거나 1일 전인 경우에만 알림 생성
                if (daysUntilDeadline == 3 || daysUntilDeadline == 1) {
                    // 해당 장학금을 찜한 모든 사용자에게 알림 발송
                    List<ScholarshipBookmark> bookmarks = scholarshipBookmarkMapper
                        .findByScholarshipId(scholarship.getId());
                    
                    for (ScholarshipBookmark bookmark : bookmarks) {
                        try {
                            notificationService.createDeadlineReminderNotification(
                                bookmark.getUserNm(),
                                scholarship.getId(),
                                scholarship.getScholarshipName(),
                                (int) daysUntilDeadline
                            );
                            
                            log.info("마감임박 알림 생성: 사용자 {}, 장학금 {}, {}일 남음", 
                                bookmark.getUserNm(), scholarship.getScholarshipName(), daysUntilDeadline);
                        } catch (Exception e) {
                            log.error("마감임박 알림 생성 실패: 사용자 {}, 장학금 {}", 
                                bookmark.getUserNm(), scholarship.getScholarshipName(), e);
                        }
                    }
                }
            }
            
            log.info("마감임박 알림 체크 완료");
        } catch (Exception e) {
            log.error("마감임박 알림 체크 중 오류 발생", e);
        }
    }

    /**
     * 매일 오전 10시에 새로운 장학금 알림을 확인하고 생성합니다.
     */
    @Scheduled(cron = "0 0 10 * * *") // 매일 오전 10시
    public void checkNewScholarshipNotifications() {
        log.info("새로운 장학금 알림 체크 시작");
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            
            // 어제 등록된 새로운 장학금들 조회
            List<Scholarship> newScholarships = scholarshipMapper.findScholarshipsCreatedBetween(
                yesterday.toString(), 
                today.toString()
            );
            
            // 모든 활성 사용자에게 알림 발송 (실제로는 사용자 조건에 따라 필터링 필요)
            for (Scholarship scholarship : newScholarships) {
                try {
                    // 임시로 시스템 알림으로 처리 (실제로는 모든 사용자 또는 조건에 맞는 사용자들에게)
                    notificationService.createNewScholarshipNotification(
                        "SYSTEM", // 실제로는 대상 사용자들을 조회해서 각각 알림 생성
                        scholarship.getId(),
                        scholarship.getScholarshipName(),
                        scholarship.getAmount()
                    );
                    
                    log.info("새로운 장학금 알림 생성: {}", scholarship.getScholarshipName());
                } catch (Exception e) {
                    log.error("새로운 장학금 알림 생성 실패: {}", scholarship.getScholarshipName(), e);
                }
            }
            
            log.info("새로운 장학금 알림 체크 완료");
        } catch (Exception e) {
            log.error("새로운 장학금 알림 체크 중 오류 발생", e);
        }
    }
}