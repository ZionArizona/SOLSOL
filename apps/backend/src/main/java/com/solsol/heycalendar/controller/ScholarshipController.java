package com.solsol.heycalendar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.dto.request.ScholarshipRequest;
import com.solsol.heycalendar.dto.response.ScholarshipResponse;
import com.solsol.heycalendar.security.CustomUserPrincipal;
import com.solsol.heycalendar.service.ScholarshipService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.solsol.heycalendar.dto.request.*;
import com.solsol.heycalendar.dto.response.*;


@Tag(name = "장학금 관리", description = "장학금 정보 관리 API")
@RestController
@RequestMapping("/api/scholarships")
@RequiredArgsConstructor
public class ScholarshipController {

	private final ScholarshipService service;

	@Operation(summary = "장학금 전체 목록")
	@GetMapping
	public ResponseEntity<ApiResponse<List<ScholarshipResponse>>> getAll() {
		System.out.println("getAll");
		return ResponseEntity.ok(new ApiResponse<>(true, "OK", "OK", service.getAllScholarships()));
	}

	@Operation(summary = "사용자 맞춤 장학금 목록 (자동 필터링)")
	@GetMapping("/filtered")
	public ResponseEntity<ApiResponse<List<ScholarshipWithStateResponse>>> getFilteredScholarships(
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String status,
			@AuthenticationPrincipal CustomUserPrincipal principal) {
		try {
			String userNm = principal.getUserNm();
			List<ScholarshipWithStateResponse> scholarships = service.getFilteredScholarshipsForUser(userNm, category, status);
			return ResponseEntity.ok(new ApiResponse<>(true, "사용자 맞춤 장학금 조회 성공", "OK", scholarships));
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body(new ApiResponse<>(false, "장학금 조회 실패", "ERROR", null));
		}
	}

	@Operation(summary = "장학금 상세")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> get(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "OK", "OK", service.getScholarshipById(id)));
	}

	@Operation(summary = "장학금 생성")
	@PostMapping
	public ResponseEntity<ApiResponse<ScholarshipResponse>> create(@Valid @RequestBody ScholarshipRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "생성 성공", "OK", service.createScholarship(request)));
	}

	@Operation(summary = "장학금 수정")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> update(@PathVariable Long id,
																   @Valid @RequestBody ScholarshipRequest request) {
		return ResponseEntity.ok(new ApiResponse<>(true, "수정 성공", "OK", service.updateScholarship(id, request)));
	}

	@Operation(summary = "장학금 삭제")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
		service.deleteScholarship(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "삭제 성공", "OK", null));
	}

	/* === Criteria === */
	@Operation(summary="평가기준 목록")
	@GetMapping("/{scholarshipId}/criteria")
	public ResponseEntity<ApiResponse<List<CriteriaResponse>>> listCriteria(@PathVariable Long scholarshipId){
		return ResponseEntity.ok(new ApiResponse<>(true,"OK","OK", service.listCriteria(scholarshipId)));
	}

	@Operation(summary="평가기준 추가")
	@PostMapping("/{scholarshipId}/criteria")
	public ResponseEntity<ApiResponse<CriteriaResponse>> addCriteria(@PathVariable Long scholarshipId,
																	 @Valid @RequestBody CriteriaCreateRequest req){
		return ResponseEntity.ok(new ApiResponse<>(true,"CREATED","OK", service.addCriteria(scholarshipId, req)));
	}

	@Operation(summary="평가기준 수정")
	@PutMapping("/{scholarshipId}/criteria/{criteriaId}")
	public ResponseEntity<ApiResponse<CriteriaResponse>> updateCriteria(@PathVariable Long scholarshipId,
																		@PathVariable Long criteriaId,
																		@Valid @RequestBody CriteriaUpdateRequest req){
		return ResponseEntity.ok(new ApiResponse<>(true,"UPDATED","OK", service.updateCriteria(criteriaId, req)));
	}

	@Operation(summary="평가기준 삭제")
	@DeleteMapping("/{scholarshipId}/criteria/{criteriaId}")
	public ResponseEntity<ApiResponse<Void>> deleteCriteria(@PathVariable Long scholarshipId,
															@PathVariable Long criteriaId){
		service.deleteCriteria(criteriaId);
		return ResponseEntity.ok(new ApiResponse<>(true,"DELETED","OK", null));
	}


	/* === Tags === */
	@Operation(summary="태그 목록")
	@GetMapping("/{scholarshipId}/tags")
	public ResponseEntity<ApiResponse<List<TagResponse>>> listTags(@PathVariable Long scholarshipId){
		return ResponseEntity.ok(new ApiResponse<>(true,"OK","OK", service.listTags(scholarshipId)));
	}

	@Operation(summary="태그 추가(배열)")
	@PostMapping("/{scholarshipId}/tags")
	public ResponseEntity<ApiResponse<List<TagResponse>>> addTags(@PathVariable Long scholarshipId,
																  @Valid @RequestBody TagCreateRequest req){
		return ResponseEntity.ok(new ApiResponse<>(true,"CREATED","OK", service.addTags(scholarshipId, req)));
	}

	@Operation(summary="태그 삭제")
	@DeleteMapping("/{scholarshipId}/tags/{tagId}")
	public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable Long scholarshipId,
													   @PathVariable Long tagId){
		service.deleteTag(tagId);
		return ResponseEntity.ok(new ApiResponse<>(true,"DELETED","OK", null));
	}


	/* === Notice === */
	@Operation(summary="공지 목록")
	@GetMapping("/{scholarshipId}/notices")
	public ResponseEntity<ApiResponse<List<NoticeResponse>>> listNotices(@PathVariable Long scholarshipId){
		return ResponseEntity.ok(new ApiResponse<>(true,"OK","OK", service.listNotices(scholarshipId)));
	}

	@Operation(summary="공지 생성")
	@PostMapping("/{scholarshipId}/notices")
	public ResponseEntity<ApiResponse<NoticeResponse>> createNotice(@PathVariable Long scholarshipId,
																	@Valid @RequestBody NoticeCreateRequest req){
		return ResponseEntity.ok(new ApiResponse<>(true,"CREATED","OK", service.createNotice(scholarshipId, req)));
	}

	@Operation(summary="공지 수정")
	@PutMapping("/{scholarshipId}/notices/{noticeId}")
	public ResponseEntity<ApiResponse<NoticeResponse>> updateNotice(@PathVariable Long scholarshipId,
																	@PathVariable Long noticeId,
																	@Valid @RequestBody NoticeUpdateRequest req){
		return ResponseEntity.ok(new ApiResponse<>(true,"UPDATED","OK", service.updateNotice(noticeId, req)));
	}

	@Operation(summary="공지 삭제")
	@DeleteMapping("/{scholarshipId}/notices/{noticeId}")
	public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long scholarshipId,
														  @PathVariable Long noticeId){
		service.deleteNotice(noticeId);
		return ResponseEntity.ok(new ApiResponse<>(true,"DELETED","OK", null));
	}

	/* === 전체 공지사항 === */
	@Operation(summary="전체 장학금 공지사항 목록")
	@GetMapping("/notices")
	public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAllNotices(){
		return ResponseEntity.ok(new ApiResponse<>(true,"OK","OK", service.getAllNotices()));
	}

	@Operation(summary="개별 장학금 공지사항 조회")
	@GetMapping("/notices/{noticeId}")
	public ResponseEntity<ApiResponse<NoticeResponse>> getNoticeById(@PathVariable Long noticeId){
		return ResponseEntity.ok(new ApiResponse<>(true,"OK","OK", service.getNoticeById(noticeId)));
	}

	@Operation(summary = "장학금 카테고리 목록 조회")
	@GetMapping("/categories")
	public ResponseEntity<ApiResponse<List<String>>> getCategories() {
		try {
			List<String> categories = service.getAvailableCategories();
			return ResponseEntity.ok(new ApiResponse<>(true, "카테고리 조회 성공", "OK", categories));
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body(new ApiResponse<>(false, "카테고리 조회 실패", "ERROR", null));
		}
	}

}
