package com.solsol.heycalendar.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AffiliationMapper {
	String findUniversityName(@Param("univNm") Long univNm);

	String findCollegeName(@Param("collegeNm") Long collegeNm,
		@Param("univNm") Long univNm);

	String findDepartmentName(@Param("deptNm") Long deptNm,
		@Param("collegeNm") Long collegeNm,
		@Param("univNm") Long univNm);
}
