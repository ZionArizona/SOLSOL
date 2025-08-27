package com.solsol.heycalendar.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.mapper.ScholarshipBookmarkMapper;
import com.solsol.heycalendar.mapper.ScholarshipMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final ScholarshipBookmarkMapper bookmarkMapper;
    private final ScholarshipMapper scholarshipMapper;

    /**
     * 장학금 북마크 추가
     */
    @Transactional
    public void addBookmark(String userNm, Long scholarshipId) {
        log.info("Adding bookmark for user {} scholarship {}", userNm, scholarshipId);

        // 이미 북마크했는지 확인
        if (bookmarkMapper.exists(userNm, scholarshipId)) {
            throw new IllegalStateException("이미 찜한 장학금입니다.");
        }

        // 장학금이 존재하는지 확인
        Scholarship scholarship = scholarshipMapper.findById(scholarshipId);
        if (scholarship == null) {
            throw new IllegalArgumentException("존재하지 않는 장학금입니다.");
        }

        ScholarshipBookmark bookmark = ScholarshipBookmark.builder()
            .userNm(userNm)
            .scholarshipId(scholarshipId)
            .createdAt(LocalDateTime.now())
            .build();

        bookmarkMapper.insert(bookmark);
        log.info("Bookmark added successfully for user {} scholarship {}", userNm, scholarshipId);
    }

    /**
     * 장학금 북마크 제거
     */
    @Transactional
    public void removeBookmark(String userNm, Long scholarshipId) {
        log.info("Removing bookmark for user {} scholarship {}", userNm, scholarshipId);

        if (!bookmarkMapper.exists(userNm, scholarshipId)) {
            throw new IllegalArgumentException("북마크하지 않은 장학금입니다.");
        }

        bookmarkMapper.delete(userNm, scholarshipId);
        log.info("Bookmark removed successfully for user {} scholarship {}", userNm, scholarshipId);
    }

    /**
     * 북마크 토글 (추가/제거)
     */
    @Transactional
    public boolean toggleBookmark(String userNm, Long scholarshipId) {
        log.info("Toggling bookmark for user {} scholarship {}", userNm, scholarshipId);

        if (bookmarkMapper.exists(userNm, scholarshipId)) {
            removeBookmark(userNm, scholarshipId);
            return false; // 제거됨
        } else {
            addBookmark(userNm, scholarshipId);
            return true; // 추가됨
        }
    }

    /**
     * 북마크 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isBookmarked(String userNm, Long scholarshipId) {
        return bookmarkMapper.exists(userNm, scholarshipId);
    }

    /**
     * 사용자별 북마크한 장학금 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Scholarship> getUserBookmarkedScholarships(String userNm) {
        log.info("Getting bookmarked scholarships for user: {}", userNm);
        return bookmarkMapper.findBookmarkedScholarshipsByUser(userNm);
    }

    /**
     * 사용자별 북마크 수 조회
     */
    @Transactional(readOnly = true)
    public int getUserBookmarkCount(String userNm) {
        return bookmarkMapper.countByUser(userNm);
    }

    /**
     * 특정 장학금을 북마크한 사용자 목록 조회 (알림용)
     */
    @Transactional(readOnly = true)
    public List<ScholarshipBookmark> getScholarshipBookmarks(Long scholarshipId) {
        return bookmarkMapper.findByScholarshipId(scholarshipId);
    }
}