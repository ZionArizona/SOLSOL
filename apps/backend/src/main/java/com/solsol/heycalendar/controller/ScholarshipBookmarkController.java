package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.service.ScholarshipBookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class ScholarshipBookmarkController {
    
    private final ScholarshipBookmarkService bookmarkService;

    /**
     * 장학금 찜하기
     */
    @PostMapping("/scholarships/{scholarshipId}")
    public ResponseEntity<String> bookmarkScholarship(
            @PathVariable Long scholarshipId,
            Authentication authentication) {
        try {
            String userNm = authentication.getName();
            bookmarkService.bookmarkScholarship(userNm, scholarshipId);
            return ResponseEntity.ok("장학금을 찜목록에 추가했습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error bookmarking scholarship", e);
            return ResponseEntity.internalServerError().body("찜하기 중 오류가 발생했습니다.");
        }
    }

    /**
     * 장학금 찜 취소
     */
    @DeleteMapping("/scholarships/{scholarshipId}")
    public ResponseEntity<String> unbookmarkScholarship(
            @PathVariable Long scholarshipId,
            Authentication authentication) {
        try {
            String userNm = authentication.getName();
            bookmarkService.unbookmarkScholarship(userNm, scholarshipId);
            return ResponseEntity.ok("찜목록에서 제거했습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error unbookmarking scholarship", e);
            return ResponseEntity.internalServerError().body("찜 취소 중 오류가 발생했습니다.");
        }
    }

    /**
     * 찜 여부 확인
     */
    @GetMapping("/scholarships/{scholarshipId}/status")
    public ResponseEntity<Boolean> checkBookmarkStatus(
            @PathVariable Long scholarshipId,
            Authentication authentication) {
        try {
            String userNm = authentication.getName();
            boolean isBookmarked = bookmarkService.isBookmarked(userNm, scholarshipId);
            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            log.error("Error checking bookmark status", e);
            return ResponseEntity.internalServerError().body(false);
        }
    }

    /**
     * 사용자의 찜목록 조회
     */
    @GetMapping("/my-scholarships")
    public ResponseEntity<List<Scholarship>> getMyBookmarkedScholarships(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            List<Scholarship> scholarships = bookmarkService.getBookmarkedScholarships(userNm);
            return ResponseEntity.ok(scholarships);
        } catch (Exception e) {
            log.error("Error getting bookmarked scholarships", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 찜목록 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Integer> getBookmarkCount(Authentication authentication) {
        try {
            String userNm = authentication.getName();
            int count = bookmarkService.getBookmarkCount(userNm);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error getting bookmark count", e);
            return ResponseEntity.internalServerError().body(0);
        }
    }
}