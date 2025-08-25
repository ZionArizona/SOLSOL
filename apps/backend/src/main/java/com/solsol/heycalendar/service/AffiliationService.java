package com.solsol.heycalendar.service;

import com.solsol.heycalendar.mapper.AffiliationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * 대학/단과대/학과 ID를 이름으로 매핑하는 서비스.
 * 이름만 필요하므로 조회 후 문자열만 반환한다.
 */
@Service
@RequiredArgsConstructor
public class AffiliationService {

	private final AffiliationMapper mapper;

	@Cacheable(value = "univName", key = "#univNm", unless = "#result == null")
	public String getUniversityName(Long univNm) {
		return (univNm == null) ? null : mapper.findUniversityName(univNm);
	}

	@Cacheable(value = "collegeName", key = "#univNm + ':' + #collegeNm", unless = "#result == null")
	public String getCollegeName(Long univNm, Long collegeNm) {
		return (univNm == null || collegeNm == null) ? null : mapper.findCollegeName(collegeNm, univNm);
	}

	@Cacheable(value = "deptName", key = "#univNm + ':' + #collegeNm + ':' + #deptNm", unless = "#result == null")
	public String getDepartmentName(Long univNm, Long collegeNm, Long deptNm) {
		return (univNm == null || collegeNm == null || deptNm == null) ? null :
			mapper.findDepartmentName(deptNm, collegeNm, univNm);
	}
}
