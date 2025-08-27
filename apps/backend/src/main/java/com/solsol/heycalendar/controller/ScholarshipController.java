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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "장학금 관리", description = "장학금 정보 관리 및 자격요건 설정 API")
@RestController
@RequestMapping("/api/scholarships")
@RequiredArgsConstructor
public class ScholarshipController {

	private final ScholarshipService scholarshipService;

	@Operation(summary = "장학금 전체 목록 조회", description = "등록된 모든 장학금 목록을 조회합니다.")
	@GetMapping
	public ResponseEntity<ApiResponse<List<ScholarshipListResponse>>> getAllScholarships() {
		List<ScholarshipListResponse> scholarships = scholarshipService.getAllScholarships();
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 목록 조회 성공", "OK", scholarships));
	}

	@Operation(summary = "장학금 상세 정보 조회", description = "특정 ID의 장학금 상세 정보를 조회합니다.")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> getScholarshipById(@PathVariable Long id) {
		ScholarshipResponse scholarship = scholarshipService.getScholarshipById(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 조회 성공", "OK", scholarship));
	}

	@Operation(summary = "장학금 새로 등록", description = "새로운 장학금 정보를 등록합니다.")
	@PostMapping
	public ResponseEntity<ApiResponse<ScholarshipResponse>> createScholarship(@Valid @RequestBody ScholarshipRequest request) {
		ScholarshipResponse scholarship = scholarshipService.createScholarship(request);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 생성 성공", "OK", scholarship));
	}

	@Operation(summary = "장학금 정보 수정", description = "기존 장학금의 정보를 수정합니다.")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ScholarshipResponse>> updateScholarship(
			@PathVariable Long id,
			@Valid @RequestBody ScholarshipRequest request) {
		ScholarshipResponse scholarship = scholarshipService.updateScholarship(id, request);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 수정 성공", "OK", scholarship));
	}

	@Operation(summary = "장학금 삭제", description = "등록된 장학금을 삭제합니다.")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteScholarship(@PathVariable Long id) {
		scholarshipService.deleteScholarship(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "장학금 삭제 성공", "OK", null));
	}

	@Operation(summary = "장학금 자격요건 조회", description = "특정 장학금에 대한 자격요건 목록을 조회합니다.")
	@GetMapping("/{id}/eligibilities")
	public ResponseEntity<ApiResponse<List<EligibilityResponse>>> getEligibilities(@PathVariable Long id) {
		List<EligibilityResponse> eligibilities = scholarshipService.getEligibilities(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "자격요건 조회 성공", "OK", eligibilities));
	}

	@Operation(summary = "장학금 자격요건 추가", description = "특정 장학금에 새로운 자격요건을 추가합니다.")
	@PostMapping("/{id}/eligibilities")
	public ResponseEntity<ApiResponse<EligibilityResponse>> addEligibility(
			@PathVariable Long id,
			@Valid @RequestBody EligibilityRequest request) {
		EligibilityResponse eligibility = scholarshipService.addEligibility(id, request);
		return ResponseEntity.ok(new ApiResponse<>(true, "자격요건 추가 성공", "OK", eligibility));
	}
}