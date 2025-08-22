package com.solsol.heycalendar.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solsol.heycalendar.domain.Document;
import com.solsol.heycalendar.domain.Eligibility;
import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.dto.request.EligibilityRequest;
import com.solsol.heycalendar.dto.request.ScholarshipRequest;
import com.solsol.heycalendar.dto.response.DocumentResponse;
import com.solsol.heycalendar.dto.response.EligibilityResponse;
import com.solsol.heycalendar.dto.response.ScholarshipListResponse;
import com.solsol.heycalendar.dto.response.ScholarshipResponse;
import com.solsol.heycalendar.mapper.DocumentMapper;
import com.solsol.heycalendar.mapper.EligibilityMapper;
import com.solsol.heycalendar.mapper.ScholarshipMapper;

import lombok.RequiredArgsConstructor;

/**
 * 장학금 관리 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
public class ScholarshipService {

	private final ScholarshipMapper scholarshipMapper;
	private final EligibilityMapper eligibilityMapper;
	private final DocumentMapper documentMapper;

	/**
	 * 모든 장학금 목록을 조회합니다.
	 *
	 * @return 장학금 목록
	 */
	@Transactional(readOnly = true)
	public List<ScholarshipListResponse> getAllScholarships() {
		List<Scholarship> scholarships = scholarshipMapper.findAll();
		return scholarships.stream()
				.map(this::convertToListResponse)
				.collect(Collectors.toList());
	}

	/**
	 * 특정 장학금의 상세 정보를 조회합니다.
	 *
	 * @param id 장학금 ID
	 * @return 장학금 상세 정보
	 * @throws RuntimeException 장학금을 찾을 수 없는 경우
	 */
	@Transactional(readOnly = true)
	public ScholarshipResponse getScholarshipById(Long id) {
		Scholarship scholarship = scholarshipMapper.findById(id);
		if (scholarship == null) {
			throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);
		}

		List<Eligibility> eligibilities = eligibilityMapper.findByScholarshipNm(id);
		List<Document> documents = documentMapper.findByScholarshipNm(id);

		return convertToResponse(scholarship, eligibilities, documents);
	}

	/**
	 * 새로운 장학금을 생성합니다.
	 *
	 * @param request 장학금 생성 요청 정보
	 * @return 생성된 장학금 정보
	 */
	@Transactional
	public ScholarshipResponse createScholarship(ScholarshipRequest request) {
		validateScholarshipDates(request);

		Scholarship scholarship = Scholarship.builder()
				.title(request.getTitle())
				.description(request.getDescription())
				.startDate(request.getStartDate())
				.endDate(request.getEndDate())
				.reviewDuration(request.getReviewDuration())
				.amount(request.getAmount())
				.createdBy(getCurrentUserId()) // TODO: 현재 사용자 ID 가져오기
				.createdAt(LocalDateTime.now())
				.build();

		scholarshipMapper.insert(scholarship);
		return getScholarshipById(scholarship.getScholarshipNm());
	}

	/**
	 * 기존 장학금 정보를 수정합니다.
	 *
	 * @param id      장학금 ID
	 * @param request 장학금 수정 요청 정보
	 * @return 수정된 장학금 정보
	 * @throws RuntimeException 장학금을 찾을 수 없는 경우
	 */
	@Transactional
	public ScholarshipResponse updateScholarship(Long id, ScholarshipRequest request) {
		Scholarship existingScholarship = scholarshipMapper.findById(id);
		if (existingScholarship == null) {
			throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);
		}

		validateScholarshipDates(request);

		Scholarship scholarship = Scholarship.builder()
				.scholarshipNm(id)
				.title(request.getTitle())
				.description(request.getDescription())
				.startDate(request.getStartDate())
				.endDate(request.getEndDate())
				.reviewDuration(request.getReviewDuration())
				.amount(request.getAmount())
				.createdBy(existingScholarship.getCreatedBy())
				.createdAt(existingScholarship.getCreatedAt())
				.build();

		scholarshipMapper.update(scholarship);
		return getScholarshipById(id);
	}

	/**
	 * 장학금을 삭제합니다.
	 *
	 * @param id 장학금 ID
	 * @throws RuntimeException 장학금을 찾을 수 없는 경우
	 */
	@Transactional
	public void deleteScholarship(Long id) {
		Scholarship scholarship = scholarshipMapper.findById(id);
		if (scholarship == null) {
			throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);
		}

		// 관련된 자격요건과 서류도 함께 삭제
		eligibilityMapper.deleteByScholarshipNm(id);
		documentMapper.deleteByScholarshipNm(id);
		scholarshipMapper.delete(id);
	}

	/**
	 * 특정 장학금의 자격요건 목록을 조회합니다.
	 *
	 * @param scholarshipId 장학금 ID
	 * @return 자격요건 목록
	 */
	@Transactional(readOnly = true)
	public List<EligibilityResponse> getEligibilities(Long scholarshipId) {
		List<Eligibility> eligibilities = eligibilityMapper.findByScholarshipNm(scholarshipId);
		return eligibilities.stream()
				.map(this::convertToEligibilityResponse)
				.collect(Collectors.toList());
	}

	/**
	 * 장학금에 새로운 자격요건을 추가합니다.
	 *
	 * @param scholarshipId 장학금 ID
	 * @param request       자격요건 생성 요청 정보
	 * @return 생성된 자격요건 정보
	 * @throws RuntimeException 장학금을 찾을 수 없는 경우
	 */
	@Transactional
	public EligibilityResponse addEligibility(Long scholarshipId, EligibilityRequest request) {
		Scholarship scholarship = scholarshipMapper.findById(scholarshipId);
		if (scholarship == null) {
			throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + scholarshipId);
		}

		Eligibility eligibility = Eligibility.builder()
				.scholarshipNm(scholarshipId)
				.field(request.getField())
				.operator(request.getOperator())
				.value(request.getValue())
				.content(request.getContent())
				.build();

		eligibilityMapper.insert(eligibility);
		return convertToEligibilityResponse(eligibility);
	}

	/**
	 * 장학금 날짜 유효성을 검증합니다.
	 *
	 * @param request 장학금 요청 정보
	 * @throws RuntimeException 시작일이 종료일보다 늦은 경우
	 */
	private void validateScholarshipDates(ScholarshipRequest request) {
		if (request.getStartDate().isAfter(request.getEndDate())) {
			throw new RuntimeException("시작일은 종료일보다 이전이어야 합니다.");
		}
	}

	/**
	 * 현재 로그인한 사용자의 ID를 가져옵니다.
	 * TODO: Spring Security에서 현재 사용자 정보 가져오기
	 *
	 * @return 사용자 ID
	 */
	private Long getCurrentUserId() {
		// TODO: SecurityContextHolder에서 현재 사용자 정보 가져오기
		return 1L; // 임시로 1L 반환
	}

	/**
	 * Scholarship 엔티티를 ScholarshipListResponse로 변환합니다.
	 */
	private ScholarshipListResponse convertToListResponse(Scholarship scholarship) {
		return ScholarshipListResponse.builder()
				.scholarshipNm(scholarship.getScholarshipNm())
				.title(scholarship.getTitle())
				.description(scholarship.getDescription())
				.startDate(scholarship.getStartDate())
				.endDate(scholarship.getEndDate())
				.createdAt(scholarship.getCreatedAt())
				.amount(scholarship.getAmount())
				.build();
	}

	/**
	 * Scholarship 엔티티를 ScholarshipResponse로 변환합니다.
	 */
	private ScholarshipResponse convertToResponse(Scholarship scholarship, List<Eligibility> eligibilities, List<Document> documents) {
		return ScholarshipResponse.builder()
				.scholarshipNm(scholarship.getScholarshipNm())
				.title(scholarship.getTitle())
				.description(scholarship.getDescription())
				.startDate(scholarship.getStartDate())
				.endDate(scholarship.getEndDate())
				.createdBy(scholarship.getCreatedBy())
				.createdAt(scholarship.getCreatedAt())
				.reviewDuration(scholarship.getReviewDuration())
				.amount(scholarship.getAmount())
				.eligibilities(eligibilities.stream()
						.map(this::convertToEligibilityResponse)
						.collect(Collectors.toList()))
				.documents(documents.stream()
						.map(this::convertToDocumentResponse)
						.collect(Collectors.toList()))
				.build();
	}

	/**
	 * Eligibility 엔티티를 EligibilityResponse로 변환합니다.
	 */
	private EligibilityResponse convertToEligibilityResponse(Eligibility eligibility) {
		return EligibilityResponse.builder()
				.eligibilityNm(eligibility.getEligibilityNm())
				.scholarshipNm(eligibility.getScholarshipNm())
				.field(eligibility.getField())
				.operator(eligibility.getOperator())
				.value(eligibility.getValue())
				.content(eligibility.getContent())
				.build();
	}

	/**
	 * Document 엔티티를 DocumentResponse로 변환합니다.
	 */
	private DocumentResponse convertToDocumentResponse(Document document) {
		return DocumentResponse.builder()
				.documentNm(document.getDocumentNm())
				.scholarshipNm(document.getScholarshipNm())
				.name(document.getName())
				.description(document.getDescription())
				.build();
	}
}