package com.solsol.heycalendar.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.service.BookmarkService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "장학금 북마크", description = "장학금 찜하기 관련 API")
@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Slf4j
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @Operation(summary = "장학금 북마크 추가")
    @PostMapping("/{scholarshipId}")
    public ResponseEntity<ApiResponse<Void>> addBookmark(
            @RequestHeader("user-nm") String userNm,
            @PathVariable Long scholarshipId) {
        
        log.info("User {} adding bookmark for scholarship {}", userNm, scholarshipId);
        bookmarkService.addBookmark(userNm, scholarshipId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "찜목록에 추가되었습니다.", "OK", null));
    }

    @Operation(summary = "장학금 북마크 제거")
    @DeleteMapping("/{scholarshipId}")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @RequestHeader("user-nm") String userNm,
            @PathVariable Long scholarshipId) {
        
        log.info("User {} removing bookmark for scholarship {}", userNm, scholarshipId);
        bookmarkService.removeBookmark(userNm, scholarshipId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "찜목록에서 제거되었습니다.", "OK", null));
    }

    @Operation(summary = "장학금 북마크 토글")
    @PostMapping("/{scholarshipId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleBookmark(
            @RequestHeader("user-nm") String userNm,
            @PathVariable Long scholarshipId) {
        
        log.info("User {} toggling bookmark for scholarship {}", userNm, scholarshipId);
        boolean isBookmarked = bookmarkService.toggleBookmark(userNm, scholarshipId);
        
        String message = isBookmarked ? "찜목록에 추가되었습니다." : "찜목록에서 제거되었습니다.";
        Map<String, Boolean> result = Map.of("isBookmarked", isBookmarked);
        
        return ResponseEntity.ok(new ApiResponse<>(true, message, "OK", result));
    }

    @Operation(summary = "장학금 북마크 여부 확인")
    @GetMapping("/{scholarshipId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkBookmark(
            @RequestHeader("user-nm") String userNm,
            @PathVariable Long scholarshipId) {
        
        boolean isBookmarked = bookmarkService.isBookmarked(userNm, scholarshipId);
        Map<String, Boolean> result = Map.of("isBookmarked", isBookmarked);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", result));
    }

    @Operation(summary = "내 북마크한 장학금 목록 조회")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Scholarship>>> getMyBookmarks(
            @RequestHeader("user-nm") String userNm) {
        
        log.info("Getting bookmarks for user: {}", userNm);
        List<Scholarship> scholarships = bookmarkService.getUserBookmarkedScholarships(userNm);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", scholarships));
    }

    @Operation(summary = "내 북마크 수 조회")
    @GetMapping("/my/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getMyBookmarkCount(
            @RequestHeader("user-nm") String userNm) {
        
        int count = bookmarkService.getUserBookmarkCount(userNm);
        Map<String, Integer> result = Map.of("count", count);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", "OK", result));
    }
}