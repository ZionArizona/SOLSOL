package com.solsol.heycalendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.Eligibility;

@Mapper
public interface EligibilityMapper {
	
	/**
	 * 특정 장학금의 자격요건 목록을 조회합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 * @return 자격요건 목록
	 */
	List<Eligibility> findByScholarshipNm(@Param("scholarshipNm") Long scholarshipNm);
	
	/**
	 * ID로 자격요건을 조회합니다.
	 *
	 * @param eligibilityNm 자격요건 ID
	 * @return 자격요건 정보
	 */
	Eligibility findById(@Param("eligibilityNm") Long eligibilityNm);
	
	/**
	 * 새로운 자격요건을 생성합니다.
	 *
	 * @param eligibility 자격요건 정보
	 */
	void insert(Eligibility eligibility);
	
	/**
	 * 자격요건 정보를 수정합니다.
	 *
	 * @param eligibility 수정할 자격요건 정보
	 */
	void update(Eligibility eligibility);
	
	/**
	 * 자격요건을 삭제합니다.
	 *
	 * @param eligibilityNm 자격요건 ID
	 */
	void delete(@Param("eligibilityNm") Long eligibilityNm);
	
	/**
	 * 특정 장학금의 모든 자격요건을 삭제합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 */
	void deleteByScholarshipNm(@Param("scholarshipNm") Long scholarshipNm);
}