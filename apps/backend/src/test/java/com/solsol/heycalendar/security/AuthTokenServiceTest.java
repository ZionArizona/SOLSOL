package com.solsol.heycalendar.security;

import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.service.AffiliationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthTokenServiceTest {

	@Test
	@DisplayName("AccessToken: 한글 대학/단과대/학과 이름 클레임 포함 + 콘솔 출력")
	void accessToken_containsKoreanNames_and_printToConsole() {
		// 1) AffiliationService 스텁 (ID -> 한글 이름 매핑)
		AffiliationService aff = mock(AffiliationService.class);
		when(aff.getUniversityName(1001L)).thenReturn("서울대학교");
		when(aff.getCollegeName(1001L, 2001L)).thenReturn("공과대학");
		when(aff.getDepartmentName(1001L, 2001L, 3001L)).thenReturn("컴퓨터공학과");

		// 2) JwtProperties 설정 (32바이트 이상 시크릿)
		JwtProperties props = new JwtProperties();
		props.getJwt().setSecret("mySecretKey1234567890abcdefghijklmnopqrstuvwxyz");
		props.getJwt().setIssuer("heycalendar");
		props.getJwt().setAccessExpMin(10);
		props.getJwt().setRefreshExpDays(7);

		// 3) JwtUtil(Service)을 직접 생성/초기화
		JwtUtil jwtUtil = new JwtUtil(props);
		jwtUtil.init();

		// 4) 실제 AuthTokenService 생성
		AuthTokenService tokenService = new AuthTokenService(jwtUtil, props, aff);

		// 5) 액세스 토큰 생성 (ID 전달 → 내부에서 한글 이름으로 변환)
		String token = tokenService.createAccessToken(
			"20250001", "alice", "STUDENT", "홍길동",
			3001L, 2001L, 1001L, 2
		);
		System.out.println("생성된 Access Token: " + token);

		// 6) 파싱 후 클레임 콘솔 출력 & 검증
		Jws<Claims> jws = jwtUtil.parse(token);
		Claims claims = jws.getPayload();
		System.out.println("디코드된 클레임: " + claims);

		assertThat(claims.get("typ", String.class)).isEqualTo("access");
		assertThat(claims.get("userId", String.class)).isEqualTo("alice");
		assertThat(claims.get("userName", String.class)).isEqualTo("홍길동");
		assertThat(claims.get("role", String.class)).isEqualTo("STUDENT");
		assertThat(claims.get("univName", String.class)).isEqualTo("서울대학교");
		assertThat(claims.get("collegeName", String.class)).isEqualTo("공과대학");
		assertThat(claims.get("deptName", String.class)).isEqualTo("컴퓨터공학과");
		assertThat(claims.get("grade", Integer.class)).isEqualTo(2);
	}
}
