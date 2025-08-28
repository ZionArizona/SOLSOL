package com.solsol.heycalendar.controller;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.service.ScholarshipBookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> bookmarkScholarship(
            @PathVariable Long scholarshipId,
            @RequestHeader("user-nm") String userNm) {
        try {
            bookmarkService.bookmarkScholarship(userNm, scholarshipId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "장학금을 찜목록에 추가했습니다.");
            response.put("code", "OK");
            response.put("data", null);
            return ResponseEntity.ok().body(response);
        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("code", "BAD_REQUEST");
            response.put("data", null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error bookmarking scholarship", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "찜하기 중 오류가 발생했습니다.");
            response.put("code", "INTERNAL_SERVER_ERROR");
            response.put("data", null);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 장학금 찜 취소
     */
    @DeleteMapping("/scholarships/{scholarshipId}")
    public ResponseEntity<?> unbookmarkScholarship(
            @PathVariable Long scholarshipId,
            @RequestHeader("user-nm") String userNm) {
        try {
            bookmarkService.unbookmarkScholarship(userNm, scholarshipId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜목록에서 제거했습니다.");
            response.put("code", "OK");
            response.put("data", null);
            return ResponseEntity.ok().body(response);
        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("code", "BAD_REQUEST");
            response.put("data", null);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error unbookmarking scholarship", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "찜 취소 중 오류가 발생했습니다.");
            response.put("code", "INTERNAL_SERVER_ERROR");
            response.put("data", null);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 찜 여부 확인
     */
    @GetMapping("/scholarships/{scholarshipId}/status")
    public ResponseEntity<?> checkBookmarkStatus(
            @PathVariable Long scholarshipId,
            @RequestHeader("user-nm") String userNm) {
        try {
            boolean isBookmarked = bookmarkService.isBookmarked(userNm, scholarshipId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜 여부 확인 성공");
            response.put("code", "OK");
            response.put("data", isBookmarked);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            log.error("Error checking bookmark status", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "찜 여부 확인 실패");
            response.put("code", "ERROR");
            response.put("data", false);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 사용자의 찜목록 조회
     */
    @GetMapping("/my-scholarships")
    public ResponseEntity<?> getMyBookmarkedScholarships(@RequestHeader("user-nm") String userNm) {
        try {
            List<Scholarship> scholarships = bookmarkService.getBookmarkedScholarships(userNm);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜목록 조회 성공");
            response.put("code", "OK");
            response.put("data", scholarships);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            log.error("Error getting bookmarked scholarships", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "찜목록 조회 실패");
            response.put("code", "INTERNAL_SERVER_ERROR");
            response.put("data", new ArrayList<>());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 찜목록 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<?> getBookmarkCount(@RequestHeader("user-nm") String userNm) {
        try {
            int count = bookmarkService.getBookmarkCount(userNm);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜목록 개수 조회 성공");
            response.put("code", "OK");
            response.put("data", count);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            log.error("Error getting bookmark count", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "찜목록 개수 조회 실패");
            response.put("code", "INTERNAL_SERVER_ERROR");
            response.put("data", 0);
            return ResponseEntity.internalServerError().body(response);
        }
    }
}