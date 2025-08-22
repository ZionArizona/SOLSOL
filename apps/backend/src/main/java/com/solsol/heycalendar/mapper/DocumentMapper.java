package com.solsol.heycalendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.Document;

@Mapper
public interface DocumentMapper {
	
	/**
	 * 특정 장학금의 제출서류 목록을 조회합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 * @return 제출서류 목록
	 */
	List<Document> findByScholarshipNm(@Param("scholarshipNm") Long scholarshipNm);
	
	/**
	 * ID로 제출서류를 조회합니다.
	 *
	 * @param documentNm 제출서류 ID
	 * @return 제출서류 정보
	 */
	Document findById(@Param("documentNm") Long documentNm);
	
	/**
	 * 새로운 제출서류를 생성합니다.
	 *
	 * @param document 제출서류 정보
	 */
	void insert(Document document);
	
	/**
	 * 제출서류 정보를 수정합니다.
	 *
	 * @param document 수정할 제출서류 정보
	 */
	void update(Document document);
	
	/**
	 * 제출서류를 삭제합니다.
	 *
	 * @param documentNm 제출서류 ID
	 */
	void delete(@Param("documentNm") Long documentNm);
	
	/**
	 * 특정 장학금의 모든 제출서류를 삭제합니다.
	 *
	 * @param scholarshipNm 장학금 ID
	 */
	void deleteByScholarshipNm(@Param("scholarshipNm") Long scholarshipNm);
}