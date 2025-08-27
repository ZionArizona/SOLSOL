package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.ScholarshipBookmark;
import com.solsol.heycalendar.domain.Scholarship;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScholarshipBookmarkMapper {
    
    // 찜하기 추가
    void insert(ScholarshipBookmark bookmark);
    
    // 찜하기 제거
    void delete(@Param("userNm") String userNm, @Param("scholarshipId") Long scholarshipId);
    
    // 찜 여부 확인
    boolean exists(@Param("userNm") String userNm, @Param("scholarshipId") Long scholarshipId);
    
    // 사용자의 찜목록 조회 (장학금 정보 포함)
    List<Scholarship> findBookmarkedScholarshipsByUser(@Param("userNm") String userNm);
    
    // 사용자의 찜목록 개수
    int countByUser(@Param("userNm") String userNm);
    
    // 특정 장학금을 찜한 모든 사용자 조회 (스케줄러용)
    List<ScholarshipBookmark> findByScholarshipId(@Param("scholarshipId") Long scholarshipId);
}