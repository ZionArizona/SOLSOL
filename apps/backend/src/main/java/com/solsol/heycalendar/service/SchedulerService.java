package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.mapper.ScholarshipMapper;
import com.solsol.heycalendar.mapper.ScholarshipBookmarkMapper;
import com.solsol.heycalendar.mapper.UserMapper;
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
    private final UserMapper userMapper;

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
     * 주의: 새 장학금 등록 시에는 실시간으로 알림이 생성되므로, 
     * 이 스케줄러는 시스템 오류로 누락된 알림을 보완하는 역할입니다.
     */
    @Scheduled(cron = "0 0 10 * * *") // 매일 오전 10시
    public void checkMissedNewScholarshipNotifications() {
        log.info("누락된 새로운 장학금 알림 체크 시작");
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            
            // 어제 등록된 새로운 장학금들 조회
            List<Scholarship> newScholarships = scholarshipMapper.findScholarshipsCreatedBetween(
                yesterday.toString(), 
                today.toString()
            );
            
            if (newScholarships.isEmpty()) {
                log.info("어제 등록된 새로운 장학금이 없습니다.");
                return;
            }
            
            // 모든 활성 사용자 목록 조회
            List<String> activeUsers = userMapper.findAllActiveUserNames();
            
            for (Scholarship scholarship : newScholarships) {
                log.info("장학금 알림 누락 체크: {}", scholarship.getScholarshipName());
                
                for (String userNm : activeUsers) {
                    try {
                        // 해당 사용자에게 이미 알림이 생성되었는지 확인
                        // 실제 구현에서는 NotificationMapper에 중복 체크 메서드를 추가해야 함
                        // 여기서는 간단히 알림을 생성하되, 중복 생성을 방지하는 로직 추가 필요
                        
                        notificationService.createNewScholarshipNotification(
                            userNm,
                            scholarship.getId(),
                            scholarship.getScholarshipName(),
                            scholarship.getAmount()
                        );
                        
                    } catch (Exception e) {
                        log.debug("새로운 장학금 알림 생성 실패 (이미 존재할 수 있음) - 사용자: {}, 장학금: {}", 
                            userNm, scholarship.getScholarshipName());
                    }
                }
                
                log.info("장학금 알림 누락 체크 완료: {}", scholarship.getScholarshipName());
            }
            
            log.info("누락된 새로운 장학금 알림 체크 완료");
        } catch (Exception e) {
            log.error("새로운 장학금 알림 체크 중 오류 발생", e);
        }
    }
}