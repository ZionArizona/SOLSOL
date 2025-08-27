package com.solsol.heycalendar.service;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.mapper.ScholarshipBookmarkMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScholarshipBookmarkService {
    
    private final ScholarshipBookmarkMapper scholarshipBookmarkMapper;

    /**
     * 장학금 찜하기
     */
    @Transactional
    public void bookmarkScholarship(String userNm, Long scholarshipId) {
        log.info("Adding bookmark - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
        
        // 이미 찜했는지 확인
        if (scholarshipBookmarkMapper.exists(userNm, scholarshipId)) {
            log.info("Already bookmarked - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
            return; // 이미 찜한 경우 성공으로 처리
        }
        
        ScholarshipBookmark bookmark = ScholarshipBookmark.builder()
                .userNm(userNm)
                .scholarshipId(scholarshipId)
                .createdAt(LocalDateTime.now())
                .build();
                
        scholarshipBookmarkMapper.insert(bookmark);
        log.info("Bookmark added successfully - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
    }

    /**
     * 장학금 찜 취소
     */
    @Transactional
    public void unbookmarkScholarship(String userNm, Long scholarshipId) {
        log.info("Removing bookmark - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
        
        // 찜했는지 확인
        if (!scholarshipBookmarkMapper.exists(userNm, scholarshipId)) {
            log.info("Bookmark not found - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
            return; // 이미 찜하지 않은 경우 성공으로 처리
        }
        
        scholarshipBookmarkMapper.delete(userNm, scholarshipId);
        log.info("Bookmark removed successfully - userNm: {}, scholarshipId: {}", userNm, scholarshipId);
    }

    /**
     * 찜 여부 확인
     */
    public boolean isBookmarked(String userNm, Long scholarshipId) {
        return scholarshipBookmarkMapper.exists(userNm, scholarshipId);
    }

    /**
     * 사용자의 찜목록 조회
     */
    public List<Scholarship> getBookmarkedScholarships(String userNm) {
        log.info("Getting bookmarked scholarships for user: {}", userNm);
        return scholarshipBookmarkMapper.findBookmarkedScholarshipsByUser(userNm);
    }

    /**
     * 사용자의 찜목록 개수
     */
    public int getBookmarkCount(String userNm) {
        return scholarshipBookmarkMapper.countByUser(userNm);
    }
}