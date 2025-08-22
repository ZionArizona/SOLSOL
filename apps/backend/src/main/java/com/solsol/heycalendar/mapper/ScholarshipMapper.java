package com.solsol.heycalendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.Scholarship;

@Mapper
public interface ScholarshipMapper {
	
	/**
	 * 모든 장학금 목록을 조회합니다.
	 *
	 * @return 장학금 목록
	 */
	List<Scholarship> findAll();
	
	/**
	 * ID로 장학금을 조회합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 * @return 장학금 정보
	 */
	Scholarship findById(@Param("scholarshipNm") Long scholarshipNm);
	
	/**
	 * 새로운 장학금을 생성합니다.
	 *
	 * @param scholarship 장학금 정보
	 */
	void insert(Scholarship scholarship);
	
	/**
	 * 장학금 정보를 수정합니다.
	 *
	 * @param scholarship 수정할 장학금 정보
	 */
	void update(Scholarship scholarship);
	
	/**
	 * 장학금을 삭제합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 */
	void delete(@Param("scholarshipNm") Long scholarshipNm);
}