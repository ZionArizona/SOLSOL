package com.solsol.heycalendar.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solsol.heycalendar.domain.*;
import com.solsol.heycalendar.dto.request.ScholarshipRequest;
import com.solsol.heycalendar.dto.response.ScholarshipResponse;
import com.solsol.heycalendar.mapper.ScholarshipMapper;
import com.solsol.heycalendar.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import com.solsol.heycalendar.dto.request.*;
import com.solsol.heycalendar.dto.response.*;

@Service
@RequiredArgsConstructor
public class ScholarshipService {

	private final ScholarshipMapper mapper;
	private final NotificationService notificationService;
	private final UserMapper userMapper;

	/* 목록 */
	@Transactional(readOnly = true)
	public List<ScholarshipResponse> getAllScholarships() {
		return mapper.findAll().stream()
				.map(this::toSummaryResponse)
				.collect(Collectors.toList());
	}

	/* 상세 */
	@Transactional(readOnly = true)
	public ScholarshipResponse getScholarshipById(Long id) {
		Scholarship s = mapper.findById(id);
		if (s == null) throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);

		List<ScholarshipCriteria> criteria = mapper.findCriteriaByScholarshipId(id);
		List<String> tags = mapper.findTagsByScholarshipId(id);
		ScholarshipNotice notice = mapper.findNoticeByScholarshipId(id);

		return toDetailResponse(s, criteria, tags, notice);
	}

	/* 생성 */
	@Transactional
	public ScholarshipResponse createScholarship(ScholarshipRequest req) {
		validateDates(req);

		Scholarship s = Scholarship.builder()
				.scholarshipName(req.getScholarshipName())
				.description(req.getDescription())
				.type(req.getType())
				.amount(req.getAmount())
				.numberOfRecipients(req.getNumberOfRecipients())
				.paymentMethod(req.getPaymentMethod())
				.recruitmentStartDate(req.getRecruitmentStartDate())
				.recruitmentEndDate(req.getRecruitmentEndDate())
				.evaluationStartDate(req.getEvaluationStartDate())
				.interviewDate(req.getInterviewDate())
				.resultAnnouncementDate(req.getResultAnnouncementDate())
				.evaluationMethod(req.getEvaluationMethod())
				.recruitmentStatus(Optional.ofNullable(req.getRecruitmentStatus()).orElse(RecruitmentStatus.OPEN))
				.eligibilityCondition(req.getEligibilityCondition())
				.gradeRestriction(req.getGradeRestriction())
				.majorRestriction(req.getMajorRestriction())
				.duplicateAllowed(req.getDuplicateAllowed())
				.minGpa(req.getMinGpa())
				.category(req.getCategory())
				.contactPersonName(req.getContactPersonName())
				.contactPhone(req.getContactPhone())
				.contactEmail(req.getContactEmail())
				.officeLocation(req.getOfficeLocation())
				.consultationHours(req.getConsultationHours())
				.createdBy(getCurrentUser())
				.createdAt(LocalDateTime.now())
				.build();

		mapper.insert(s); // id 생성

		// criteria
		if (req.getCriteria() != null && !req.getCriteria().isEmpty()) {
			List<ScholarshipCriteria> list = req.getCriteria().stream()
					.map(c -> ScholarshipCriteria.builder()
							.scholarshipId(s.getId())
							.name(c.getName())
							.stdPoint(c.getStd())
							.weightPercent(c.getWeight())
							.build())
					.collect(Collectors.toList());
			mapper.insertCriteria(list);
		}

		// tags
		if (req.getTags() != null && !req.getTags().isEmpty()) {
			List<ScholarshipTag> tags = req.getTags().stream()
					.map(t -> ScholarshipTag.builder().scholarshipId(s.getId()).tag(t).build())
					.collect(Collectors.toList());
			mapper.insertTags(tags);
		}

		// notice (옵션)
		if (req.getNoticeTitle() != null || req.getNoticeContent() != null || req.getNoticeImageUrl() != null) {
			ScholarshipNotice n = ScholarshipNotice.builder()
					.scholarshipId(s.getId())
					.title(req.getNoticeTitle())
					.content(req.getNoticeContent())
					.imageUrl(req.getNoticeImageUrl())
					.build();
			mapper.upsertNotice(n);
		}

		ScholarshipResponse createdScholarship = getScholarshipById(s.getId());
		
		// 새 장학금 알림 생성 - 모든 활성 사용자에게 발송
		createNewScholarshipNotifications(createdScholarship);
		
		return createdScholarship;
	}

	/* 수정 */
	@Transactional
	public ScholarshipResponse updateScholarship(Long id, ScholarshipRequest req) {
		Scholarship existing = mapper.findById(id);
		if (existing == null) throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);

		validateDates(req);

		Scholarship s = Scholarship.builder()
				.id(id)
				.scholarshipName(req.getScholarshipName())
				.description(req.getDescription())
				.type(req.getType())
				.amount(req.getAmount())
				.numberOfRecipients(req.getNumberOfRecipients())
				.paymentMethod(req.getPaymentMethod())
				.recruitmentStartDate(req.getRecruitmentStartDate())
				.recruitmentEndDate(req.getRecruitmentEndDate())
				.evaluationStartDate(req.getEvaluationStartDate())
				.interviewDate(req.getInterviewDate())
				.resultAnnouncementDate(req.getResultAnnouncementDate())
				.evaluationMethod(req.getEvaluationMethod())
				.recruitmentStatus(Optional.ofNullable(req.getRecruitmentStatus()).orElse(RecruitmentStatus.OPEN))
				.eligibilityCondition(req.getEligibilityCondition())
				.gradeRestriction(req.getGradeRestriction())
				.majorRestriction(req.getMajorRestriction())
				.duplicateAllowed(req.getDuplicateAllowed())
				.minGpa(req.getMinGpa())
				.category(req.getCategory())
				.contactPersonName(req.getContactPersonName())
				.contactPhone(req.getContactPhone())
				.contactEmail(req.getContactEmail())
				.officeLocation(req.getOfficeLocation())
				.consultationHours(req.getConsultationHours())
				.createdBy(existing.getCreatedBy())
				.createdAt(existing.getCreatedAt())
				.build();

		mapper.update(s);

		// 재설정(간단/안전): 기존 criteria, tags 싹 지우고 다시 삽입
		mapper.deleteCriteriaByScholarshipId(id);
		if (req.getCriteria() != null && !req.getCriteria().isEmpty()) {
			List<ScholarshipCriteria> list = req.getCriteria().stream()
					.map(c -> ScholarshipCriteria.builder()
							.scholarshipId(id)
							.name(c.getName())
							.stdPoint(c.getStd())
							.weightPercent(c.getWeight())
							.build())
					.collect(Collectors.toList());
			mapper.insertCriteria(list);
		}

		mapper.deleteTagsByScholarshipId(id);
		if (req.getTags() != null && !req.getTags().isEmpty()) {
			List<ScholarshipTag> tags = req.getTags().stream()
					.map(t -> ScholarshipTag.builder().scholarshipId(id).tag(t).build())
					.collect(Collectors.toList());
			mapper.insertTags(tags);
		}

		if (req.getNoticeTitle() != null || req.getNoticeContent() != null || req.getNoticeImageUrl() != null) {
			ScholarshipNotice n = ScholarshipNotice.builder()
					.scholarshipId(id)
					.title(req.getNoticeTitle())
					.content(req.getNoticeContent())
					.imageUrl(req.getNoticeImageUrl())
					.build();
			mapper.upsertNotice(n);
		} else {
			mapper.deleteNoticeByScholarshipId(id);
		}

		return getScholarshipById(id);
	}

	/* 삭제 */
	@Transactional
	public void deleteScholarship(Long id) {
		Scholarship s = mapper.findById(id);
		if (s == null) throw new RuntimeException("장학금을 찾을 수 없습니다. ID: " + id);

		mapper.deleteCriteriaByScholarshipId(id);
		mapper.deleteTagsByScholarshipId(id);
		mapper.deleteNoticeByScholarshipId(id);
		mapper.delete(id);
	}

	/* 유효성 */
	private void validateDates(ScholarshipRequest r) {
		LocalDate rs = r.getRecruitmentStartDate();
		LocalDate re = r.getRecruitmentEndDate();
		LocalDate es = r.getEvaluationStartDate();
		LocalDate ra = r.getResultAnnouncementDate();

		if (re.isBefore(Optional.ofNullable(rs).orElse(re))) {
			throw new RuntimeException("모집 종료일은 시작일 이후여야 합니다.");
		}
		if (ra.isBefore(es)) {
			throw new RuntimeException("결과 발표일은 심사 시작일 이후여야 합니다.");
		}
	}

	private String getCurrentUser() { return "system"; }

	private ScholarshipResponse toSummaryResponse(Scholarship s) {
		return ScholarshipResponse.builder()
				.id(s.getId())
				.scholarshipName(s.getScholarshipName())
				.description(s.getDescription())
				.type(s.getType())
				.amount(s.getAmount())
				.numberOfRecipients(s.getNumberOfRecipients())
				.paymentMethod(s.getPaymentMethod())
				.recruitmentStartDate(s.getRecruitmentStartDate())
				.recruitmentEndDate(s.getRecruitmentEndDate())
				.createdBy(s.getCreatedBy())
				.createdAt(s.getCreatedAt())
				.updatedAt(s.getUpdatedAt())
				.build();
	}

	private ScholarshipResponse toDetailResponse(Scholarship s, List<ScholarshipCriteria> cs, List<String> tags, ScholarshipNotice n) {
		return ScholarshipResponse.builder()
				.id(s.getId())
				.scholarshipName(s.getScholarshipName())
				.description(s.getDescription())
				.type(s.getType())
				.amount(s.getAmount())
				.numberOfRecipients(s.getNumberOfRecipients())
				.paymentMethod(s.getPaymentMethod())
				.recruitmentStartDate(s.getRecruitmentStartDate())
				.recruitmentEndDate(s.getRecruitmentEndDate())
				.evaluationStartDate(s.getEvaluationStartDate())
				.interviewDate(s.getInterviewDate())
				.resultAnnouncementDate(s.getResultAnnouncementDate())
				.evaluationMethod(s.getEvaluationMethod())
				.recruitmentStatus(s.getRecruitmentStatus())
				.eligibilityCondition(s.getEligibilityCondition())
				.gradeRestriction(s.getGradeRestriction())
				.majorRestriction(s.getMajorRestriction())
				.duplicateAllowed(s.getDuplicateAllowed())
				.minGpa(s.getMinGpa())
				.category(s.getCategory())
				.tags(tags)
				.contactPersonName(s.getContactPersonName())
				.contactPhone(s.getContactPhone())
				.contactEmail(s.getContactEmail())
				.officeLocation(s.getOfficeLocation())
				.consultationHours(s.getConsultationHours())
				.notice(n == null ? null : ScholarshipResponse.ScholarshipNoticeDto.builder()
						.id(n.getId()).title(n.getTitle()).content(n.getContent())
						.imageUrl(n.getImageUrl()).createdAt(n.getCreatedAt()).build())
				.criteria(cs.stream().map(c ->
						ScholarshipResponse.CriteriaDto.builder()
								.id(c.getId())
								.name(c.getName())
								.stdPoint(c.getStdPoint())
								.weightPercent(c.getWeightPercent())
								.build()
				).collect(Collectors.toList()))
				.createdBy(s.getCreatedBy())
				.createdAt(s.getCreatedAt())
				.updatedAt(s.getUpdatedAt())
				.build();
	}

	// com.solsol.heycalendar.service.ScholarshipService (기존 클래스에 아래 메서드들 추가)



	@Transactional(readOnly = true)
	public java.util.List<CriteriaResponse> listCriteria(Long scholarshipId){
		return mapper.findCriteriaByScholarshipId(scholarshipId).stream().map(c ->
				CriteriaResponse.builder()
						.id(c.getId()).name(c.getName()).stdPoint(c.getStdPoint())
						.weightPercent(c.getWeightPercent()).build()
		).collect(Collectors.toList());
	}

	@Transactional
	public CriteriaResponse addCriteria(Long scholarshipId, CriteriaCreateRequest req){
		ScholarshipCriteria c = ScholarshipCriteria.builder()
				.scholarshipId(scholarshipId)
				.name(req.getName())
				.stdPoint(req.getStd())
				.weightPercent(req.getWeight())
				.build();
		mapper.insertSingleCriteria(c);
		return CriteriaResponse.builder()
				.id(c.getId()).name(c.getName()).stdPoint(c.getStdPoint())
				.weightPercent(c.getWeightPercent()).build();
	}

	@Transactional
	public CriteriaResponse updateCriteria(Long criteriaId, CriteriaUpdateRequest req){
		ScholarshipCriteria curr = mapper.findCriteriaById(criteriaId);
		if(curr==null) throw new RuntimeException("Criteria not found: "+criteriaId);
		curr.setName(req.getName());
		curr.setStdPoint(req.getStd());
		curr.setWeightPercent(req.getWeight());
		mapper.updateCriteria(curr);
		return CriteriaResponse.builder()
				.id(curr.getId()).name(curr.getName()).stdPoint(curr.getStdPoint())
				.weightPercent(curr.getWeightPercent()).build();
	}

	@Transactional
	public void deleteCriteria(Long criteriaId){
		mapper.deleteCriteria(criteriaId);
	}


	/* Tags */
	@Transactional(readOnly = true)
	public java.util.List<TagResponse> listTags(Long scholarshipId){
		return mapper.findTagsByScholarshipIdFull(scholarshipId).stream().map(t ->
				TagResponse.builder().id(t.getId()).tag(t.getTag()).build()
		).collect(Collectors.toList());
	}

	@Transactional
	public java.util.List<TagResponse> addTags(Long scholarshipId, TagCreateRequest req){
		java.util.List<TagResponse> out = new java.util.ArrayList<>();
		for(String tg : req.getTags()){
			ScholarshipTag t = ScholarshipTag.builder()
					.scholarshipId(scholarshipId).tag(tg).build();
			mapper.insertTag(t);
			out.add(TagResponse.builder().id(t.getId()).tag(t.getTag()).build());
		}
		return out;
	}

	@Transactional
	public void deleteTag(Long tagId){ mapper.deleteTag(tagId); }


	/* Notice */
	@Transactional(readOnly = true)
	public java.util.List<NoticeResponse> listNotices(Long scholarshipId){
		return mapper.findNoticesByScholarshipId(scholarshipId).stream().map(n ->
				NoticeResponse.builder()
						.id(n.getId()).title(n.getTitle()).content(n.getContent())
						.imageUrl(n.getImageUrl()).createdAt(n.getCreatedAt())
						.build()
		).collect(Collectors.toList());
	}

	@Transactional
	public NoticeResponse createNotice(Long scholarshipId, NoticeCreateRequest req){
		ScholarshipNotice n = ScholarshipNotice.builder()
				.scholarshipId(scholarshipId).title(req.getTitle())
				.content(req.getContent()).imageUrl(req.getImageUrl())
				.build();
		mapper.insertNotice(n);
		return NoticeResponse.builder()
				.id(n.getId()).title(n.getTitle()).content(n.getContent())
				.imageUrl(n.getImageUrl()).createdAt(n.getCreatedAt()).build();
	}

	@Transactional
	public NoticeResponse updateNotice(Long noticeId, NoticeUpdateRequest req){
		ScholarshipNotice n = mapper.findNoticeById(noticeId);
		if(n==null) throw new RuntimeException("Notice not found: "+noticeId);
		n.setTitle(req.getTitle()); n.setContent(req.getContent()); n.setImageUrl(req.getImageUrl());
		mapper.updateNotice(n);
		return NoticeResponse.builder()
				.id(n.getId()).title(n.getTitle()).content(n.getContent())
				.imageUrl(n.getImageUrl()).createdAt(n.getCreatedAt())
				.build();
	}

	@Transactional
	public void deleteNotice(Long noticeId){ mapper.deleteNotice(noticeId); }

	/* 전체 공지사항 조회 */
	@Transactional(readOnly = true)
	public java.util.List<NoticeResponse> getAllNotices(){
		return mapper.findAllNotices().stream().map(n -> {
			// 장학금 정보도 함께 조회
			Scholarship scholarship = mapper.findById(n.getScholarshipId());
			return NoticeResponse.builder()
					.id(n.getId())
					.title(n.getTitle())
					.content(n.getContent())
					.imageUrl(n.getImageUrl())
					.createdAt(n.getCreatedAt())
					.scholarshipId(n.getScholarshipId())
					.scholarshipName(scholarship != null ? scholarship.getScholarshipName() : "알 수 없음")
					.build();
		}).collect(Collectors.toList());
	}

	/* 개별 공지사항 조회 */
	@Transactional(readOnly = true)
	public NoticeResponse getNoticeById(Long noticeId){
		ScholarshipNotice notice = mapper.findNoticeById(noticeId);
		if(notice == null) {
			throw new RuntimeException("Notice not found: " + noticeId);
		}
		
		// 장학금 정보도 함께 조회
		Scholarship scholarship = mapper.findById(notice.getScholarshipId());
		
		return NoticeResponse.builder()
				.id(notice.getId())
				.title(notice.getTitle())
				.content(notice.getContent())
				.imageUrl(notice.getImageUrl())
				.createdAt(notice.getCreatedAt())
				.scholarshipId(notice.getScholarshipId())
				.scholarshipName(scholarship != null ? scholarship.getScholarshipName() : "알 수 없음")
				.build();
	}

	/**
	 * 새 장학금 등록 시 모든 활성 사용자에게 알림 생성
	 */
	@Transactional
	private void createNewScholarshipNotifications(ScholarshipResponse scholarship) {
		try {
			// 모든 활성 사용자 조회
			List<String> activeUsers = userMapper.findAllActiveUserNames();
			
			// 각 활성 사용자에게 알림 생성
			for (String userNm : activeUsers) {
				try {
					notificationService.createNewScholarshipNotification(
						userNm,
						scholarship.getId(),
						scholarship.getScholarshipName(),
						scholarship.getAmount()
					);
				} catch (Exception e) {
					// 개별 사용자 알림 생성 실패 시 로그만 남기고 계속 진행
					System.err.println("새 장학금 알림 생성 실패 - 사용자: " + userNm + 
						", 장학금: " + scholarship.getScholarshipName() + ", 오류: " + e.getMessage());
				}
			}
			
			System.out.println("새 장학금 알림 생성 완료 - " + scholarship.getScholarshipName() + 
				" (대상 사용자: " + activeUsers.size() + "명)");
				
		} catch (Exception e) {
			// 전체 프로세스 실패 시에도 장학금 생성은 성공으로 처리
			System.err.println("새 장학금 알림 생성 프로세스 실패: " + e.getMessage());
		}
	}

	/**
	 * 사용자 맞춤 장학금 필터링 조회
	 */
	@Transactional(readOnly = true)
	public List<ScholarshipResponse> getFilteredScholarshipsForUser(String userNm, String category, String status) {
		try {
			System.out.println("🔍 필터링 요청 - 사용자: " + userNm + ", 카테고리: " + category + ", 상태: " + status);
			
			// 사용자 정보 조회 (사용자 정보가 없어도 기본 장학금은 보여줌)
			User tempUser = null;
			try {
				tempUser = userMapper.findByUserNm(userNm).orElse(null);
				if (tempUser == null) {
					System.out.println("⚠️ 사용자 정보를 찾을 수 없음: " + userNm + ", 기본 필터링 적용");
				} else {
					System.out.println("✅ 사용자 정보 조회 성공: " + tempUser.getUserName());
				}
			} catch (Exception e) {
				System.err.println("❌ 사용자 정보 조회 실패: " + e.getMessage());
				tempUser = null;
			}
			final User user = tempUser;
			
			// 모든 장학금 조회
			List<Scholarship> allScholarships = mapper.findAll();
			System.out.println("📚 전체 장학금 수: " + allScholarships.size());
		
		// 사용자 정보 기반 자동 필터링
		List<Scholarship> filteredScholarships = allScholarships.stream()
			.filter(scholarship -> {
				// 상태 필터링 (기본값: OPEN)
				String targetStatus = status != null ? status : "OPEN";
				if (!targetStatus.equals("ALL") && !scholarship.getRecruitmentStatus().name().equals(targetStatus)) {
					return false;
				}
				
				// 카테고리 필터링 (사용자가 선택한 경우) - 장학금 타입 기반
				if (category != null && !category.equals("ALL")) {
					String scholarshipTypeLabel = getTypeLabelFromEnum(scholarship.getType());
					if (!scholarshipTypeLabel.equals(category)) {
						return false;
					}
				}
				
				// 사용자 정보 기반 자동 필터링 (사용자 정보가 있는 경우에만)
				return user != null ? isEligibleForUser(scholarship, user) : true;
			})
			.collect(Collectors.toList());
		
		System.out.println("🎯 필터링 후 장학금 수: " + filteredScholarships.size());
		
		// ScholarshipResponse로 변환
		return filteredScholarships.stream()
			.map(this::toSummaryResponse)
			.collect(Collectors.toList());
			
		} catch (Exception e) {
			System.err.println("❌ 필터링 처리 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			
			// 오류 발생 시 기본 장학금 목록 반환
			try {
				List<Scholarship> basicScholarships = mapper.findAll();
				return basicScholarships.stream()
					.filter(s -> status == null || status.equals("ALL") || s.getRecruitmentStatus().name().equals(status))
					.map(this::toSummaryResponse)
					.collect(Collectors.toList());
			} catch (Exception fallbackError) {
				System.err.println("❌ 기본 장학금 조회도 실패: " + fallbackError.getMessage());
				return new ArrayList<>();
			}
		}
	}

	/**
	 * 장학금 타입 enum을 한글 라벨로 변환
	 */
	private String getTypeLabelFromEnum(ScholarshipType type) {
		if (type == null) return "기타";
		
		switch (type) {
			case ACADEMIC:
				return "성적우수";
			case FINANCIAL_AID:
				return "생활지원";
			case ACTIVITY:
				return "공로/활동";
			case OTHER:
			default:
				return "기타";
		}
	}

	/**
	 * 사용자가 해당 장학금에 지원 가능한지 확인
	 */
	private boolean isEligibleForUser(Scholarship scholarship, User user) {
		try {
			// 학년 제한 확인
			if (scholarship.getGradeRestriction() != null && !scholarship.getGradeRestriction().isEmpty()) {
				if (!scholarship.getGradeRestriction().equals("전체") && 
					!scholarship.getGradeRestriction().contains(String.valueOf(user.getGrade()))) {
					return false;
				}
			}
			
			// 최소 평점 확인 (사용자 GPA가 있는 경우)
			if (user.getGpa() != null && scholarship.getMinGpa() != null) {
				if (user.getGpa().compareTo(scholarship.getMinGpa()) < 0) {
					return false;
				}
			}
			
			// 전공 제한 확인 (향후 구현 - 현재는 기본적으로 통과)
			if (scholarship.getMajorRestriction() != null && !scholarship.getMajorRestriction().isEmpty()) {
				// 전공 제한 로직은 User 도메인에 전공 정보가 추가된 후 구현
				// 현재는 "전체" 또는 빈 값인 경우만 통과
				if (!scholarship.getMajorRestriction().equals("전체") && !scholarship.getMajorRestriction().equals("제한없음")) {
					// 추후 사용자 전공 정보와 비교 로직 추가
				}
			}
			
			return true;
			
		} catch (Exception e) {
			// 필터링 오류 시 기본적으로 포함
			System.err.println("장학금 자격 확인 오류: " + e.getMessage());
			return true;
		}
	}

	/**
	 * 카테고리 목록 조회 (장학금 타입 기반)
	 */
	@Transactional(readOnly = true)
	public List<String> getAvailableCategories() {
		try {
			// 장학금 타입을 한글 라벨로 변환하여 반환
			List<String> categories = Arrays.asList(
				"성적우수",     // ACADEMIC
				"생활지원",     // FINANCIAL_AID  
				"공로/활동",    // ACTIVITY
				"기타"         // OTHER
			);
			
			System.out.println("📋 Available categories: " + categories);
			return categories;
		} catch (Exception e) {
			System.err.println("❌ 카테고리 조회 실패: " + e.getMessage());
			return Arrays.asList("성적우수", "생활지원", "공로/활동", "기타");
		}
	}


}
