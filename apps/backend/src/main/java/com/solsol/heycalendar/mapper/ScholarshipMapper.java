package com.solsol.heycalendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.Scholarship;
import com.solsol.heycalendar.domain.ScholarshipCriteria;
import com.solsol.heycalendar.domain.ScholarshipNotice;
import com.solsol.heycalendar.domain.ScholarshipTag;

@Mapper
public interface ScholarshipMapper {

	// --- scholarship ---
	List<Scholarship> findAll();
	Scholarship findById(@Param("id") Long id);
	void insert(Scholarship scholarship);                   // useGeneratedKeys
	void update(Scholarship scholarship);
	void delete(@Param("id") Long id);

	// --- criteria ---
	void insertCriteria(@Param("list") List<ScholarshipCriteria> list);
	void insertSingleCriteria(ScholarshipCriteria criteria);
	List<ScholarshipCriteria> findCriteriaByScholarshipId(@Param("scholarshipId") Long scholarshipId);
	ScholarshipCriteria findCriteriaById(@Param("id") Long id);
	void updateCriteria(ScholarshipCriteria criteria);
	void deleteCriteria(@Param("id") Long id);
	void deleteCriteriaByScholarshipId(@Param("scholarshipId") Long scholarshipId);

	// --- tags ---
	void insertTags(@Param("list") List<ScholarshipTag> list);
	void insertTag(ScholarshipTag tag);
	List<String> findTagsByScholarshipId(@Param("scholarshipId") Long scholarshipId);
	List<ScholarshipTag> findTagsByScholarshipIdFull(@Param("scholarshipId") Long scholarshipId);
	void deleteTag(@Param("id") Long id);
	void deleteTagsByScholarshipId(@Param("scholarshipId") Long scholarshipId);

	// --- notice ---
	ScholarshipNotice findNoticeByScholarshipId(@Param("scholarshipId") Long scholarshipId);
	void upsertNotice(ScholarshipNotice notice);            // MERGE-like (XML에서 INSERT ON DUPLICATE KEY UPDATE)
	void insertNotice(ScholarshipNotice notice);
	List<ScholarshipNotice> findNoticesByScholarshipId(@Param("scholarshipId") Long scholarshipId);
	List<ScholarshipNotice> findAllNotices(); // 전체 공지사항 조회
	ScholarshipNotice findNoticeById(@Param("id") Long id);
	void updateNotice(ScholarshipNotice notice);
	void deleteNotice(@Param("id") Long id);
	void deleteNoticeByScholarshipId(@Param("scholarshipId") Long scholarshipId);

	// --- scheduler ---
	List<Scholarship> findScholarshipsEndingBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);
	List<Scholarship> findScholarshipsCreatedBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);

	// --- filter ---
	List<String> findDistinctCategories();
}