package com.solsol.heycalendar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.solsol.heycalendar.common.ApiResponse;
import com.solsol.heycalendar.dto.request.EligibilityRequest;
import com.solsol.heycalendar.dto.request.ScholarshipRequest;
import com.solsol.heycalendar.dto.response.EligibilityResponse;
import com.solsol.heycalendar.dto.response.ScholarshipListResponse;
import com.solsol.heycalendar.dto.response.ScholarshipResponse;
import com.solsol.heycalendar.service.ScholarshipService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 장학금 관리 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/scholarships")
@RequiredArgsConstructor
public class ScholarshipController {

	private final ScholarshipService scholarshipService;

	/**
	 * 모든 장학금 목록을 조회합니다.
	 *
	 * @return 장학금 목록
	 */
	@GetMapping
	public ResponseEntity<ApiResponse<List<ScholarshipListResponse>>> getAllScholarships() {
		List<ScholarshipListResponse> scholarships = scholarshipService.getAllScholarships();
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 목록 조회 성공", "OK", scholarships));
	}

	/**
	 * 특정 장학금의 상세 정보를 조회합니다.
	 *
	 * @param id 장학금 ID
	 * @return 장학금 상세 정보
	 */
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> getScholarshipById(@PathVariable Long id) {
		ScholarshipResponse scholarship = scholarshipService.getScholarshipById(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 조회 성공", "OK", scholarship));
	}

	/**
	 * 새로운 장학금을 생성합니다.
	 *
	 * @param request 장학금 생성 요청 정보
	 * @return 생성된 장학금 정보
	 */
	@PostMapping
	public ResponseEntity<ApiResponse<ScholarshipResponse>> createScholarship(@Valid @RequestBody ScholarshipRequest request) {
		ScholarshipResponse scholarship = scholarshipService.createScholarship(request);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 생성 성공", "OK", scholarship));
	}

	/**
	 * 기존 장학금 정보를 수정합니다.
	 *
	 * @param id      장학금 ID
	 * @param request 장학금 수정 요청 정보
	 * @return 수정된 장학금 정보
	 */
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> updateScholarship(
			@PathVariable Long id,
			@Valid @RequestBody ScholarshipRequest request) {
		ScholarshipResponse scholarship = scholarshipService.updateScholarship(id, request);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 수정 성공", "OK", scholarship));
	}

	/**
	 * 장학금을 삭제합니다.
	 *
	 * @param id 장학금 ID
	 * @return 삭제 성공 응답
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteScholarship(@PathVariable Long id) {
		scholarshipService.deleteScholarship(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 삭제 성공", "OK", null));
	}

	/**
	 * 특정 장학금의 자격요건 목록을 조회합니다.
	 *
	 * @param id 장학금 ID
	 * @return 자격요건 목록
	 */
	@GetMapping("/{id}/eligibilities")
	public ResponseEntity<ApiResponse<List<EligibilityResponse>>> getEligibilities(@PathVariable Long id) {
		List<EligibilityResponse> eligibilities = scholarshipService.getEligibilities(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "자격요건 조회 성공", "OK", eligibilities));
	}

	/**
	 * 장학금에 새로운 자격요건을 추가합니다.
	 *
	 * @param id      장학금 ID
	 * @param request 자격요건 생성 요청 정보
	 * @return 생성된 자격요건 정보
	 */
	@PostMapping("/{id}/eligibilities")
	public ResponseEntity<ApiResponse<EligibilityResponse>> addEligibility(
			@PathVariable Long id,
			@Valid @RequestBody EligibilityRequest request) {
		EligibilityResponse eligibility = scholarshipService.addEligibility(id, request);
		return ResponseEntity.ok(new ApiResponse<>(true, "자격요건 추가 성공", "OK", eligibility));
	}
}