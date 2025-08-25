package com.solsol.heycalendar.security;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.service.AffiliationService;

import lombok.RequiredArgsConstructor;

/**
 * 액세스 토큰 생성 시 대학/단과대/학과는 '이름 문자열'만 클레임에 포함한다.
 */
@Service
@RequiredArgsConstructor
public class AuthTokenService {

	private final JwtUtil jwtUtil;
	private final JwtProperties props;
	private final AffiliationService affiliationService;

	/**
	 * 액세스 토큰 생성
	 * 대학/단과대/학과는 ID로 조회하여 '이름 문자열'만 클레임에 포함
	 *
	 * @param userNm   토큰 subject(고유 사용자 키)
	 * @param userId   로그인 ID
	 * @param role     권한 (예: STUDENT/STAFF/ADMIN)
	 * @param userName 사용자 표시명
	 * @param deptNm   학과 ID (nullable)
	 * @param collegeNm 단과대 ID (nullable)
	 * @param univNm   대학 ID (nullable)
	 * @param grade    학년 (nullable)
	 * @return 서명된 JWT(access)
	 */
	public String createAccessToken(String userNm, String userId, String role, String userName,
		Long deptNm, Long collegeNm, Long univNm, Integer grade) {

		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getAccessExpMin() * 60L);

		// 1) 이름 조회 (ID는 토큰에 싣지 않음)
		String univName   = affiliationService.getUniversityName(univNm);
		String collegeName= affiliationService.getCollegeName(univNm, collegeNm);
		String deptName   = affiliationService.getDepartmentName(univNm, collegeNm, deptNm);

		// 2) 클레임 조립 (조직 관련은 '이름'만)
		Map<String, Object> claims = new HashMap<>();
		claims.put("userId", userId);
		claims.put("userName", userName);
		claims.put("role", role);
		claims.put("typ", "access");
		if (grade != null) claims.put("grade", grade);
		if (univName != null)   claims.put("univName", univName);
		if (collegeName != null)claims.put("collegeName", collegeName);
		if (deptName != null)   claims.put("deptName", deptName);

		return jwtUtil.sign(userNm, claims, Date.from(now), Date.from(exp));
	}

	public String createRefreshToken(String userNm, String jti) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.getJwt().getRefreshExpDays() * 86400L);

		Map<String, Object> claims = Map.of("typ", "refresh");
		return jwtUtil.sign(userNm, jti, claims, Date.from(now), Date.from(exp));
	}
}
