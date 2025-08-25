package com.solsol.heycalendar.security;

import com.solsol.heycalendar.config.JwtProperties;
import com.solsol.heycalendar.service.AffiliationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * JwtUtil은 이제 '서명/파싱/검증'만 담당.
 * 토큰 생성은 AuthTokenService를 통해 수행한다.
 */
class JwtUtilTest {

	private JwtUtil jwtUtil;
	private JwtProperties props;

	// HS256 권장: 32바이트(256bit) 이상 시크릿
	private static final String STRONG_SECRET =
		"ThisIsAStrongSecretKey_ForHS256_AtLeast32Bytes_Long_2025_heycalendar";

	// 공통 ID 샘플
	private static final Long UNIV_ID = 1001L;
	private static final Long COLLEGE_ID = 2001L;
	private static final Long DEPT_ID = 3001L;

	// 한글 이름 매핑 결과
	private static final String UNIV_NAME = "서울대학교";
	private static final String COLLEGE_NAME = "공과대학";
	private static final String DEPT_NAME = "컴퓨터공학과";

	@BeforeEach
	void setUp() {
		props = new JwtProperties();
		props.getJwt().setIssuer("heycalendar");
		props.getJwt().setSecret(STRONG_SECRET);
		props.getJwt().setAccessExpMin(30);     // 30분
		props.getJwt().setRefreshExpDays(7);    // 7일
		props.getJwt().setTokenPrefix("Bearer");
		props.getJwt().setHeaderString("Authorization");

		jwtUtil = new JwtUtil(props);
		// @PostConstruct 대체 호출 (테스트에서 수동 초기화)
		jwtUtil.init();
	}

	@Test
	@DisplayName("AuthTokenService로 생성한 AccessToken을 JwtUtil로 parse → 한글 이름 클레임 검증")
	void createAccessToken_via_service_and_parse_success() {
		// AffiliationService 목: ID → 한글 이름 매핑 스텁
		AffiliationService aff = mock(AffiliationService.class);
		when(aff.getUniversityName(UNIV_ID)).thenReturn(UNIV_NAME);
		when(aff.getCollegeName(UNIV_ID, COLLEGE_ID)).thenReturn(COLLEGE_NAME);
		when(aff.getDepartmentName(UNIV_ID, COLLEGE_ID, DEPT_ID)).thenReturn(DEPT_NAME);

		// 토큰 생성은 서비스에서 수행
		AuthTokenService tokenService = new AuthTokenService(jwtUtil, props, aff);

		String token = tokenService.createAccessToken(
			"20250001",         // userNm -> sub
			"alice",            // userId
			"STUDENT",          // role
			"홍길동",             // userName
			DEPT_ID,            // deptNm (ID는 토큰에 들어가지 않음)
			COLLEGE_ID,
			UNIV_ID,
			2                   // grade
		);

		Jws<Claims> jws = jwtUtil.parse(token);
		Claims c = jws.getPayload();

		assertThat(c.getIssuer()).isEqualTo("heycalendar");
		assertThat(c.getSubject()).isEqualTo("20250001");
		assertThat(c.get("typ", String.class)).isEqualTo("access");
		assertThat(c.get("userId", String.class)).isEqualTo("alice");
		assertThat(c.get("userName", String.class)).isEqualTo("홍길동");
		assertThat(c.get("role", String.class)).isEqualTo("STUDENT");
		assertThat(c.get("grade", Integer.class)).isEqualTo(2);

		// ✅ 한글 이름만 들어간다
		assertThat(c.get("univName", String.class)).isEqualTo(UNIV_NAME);
		assertThat(c.get("collegeName", String.class)).isEqualTo(COLLEGE_NAME);
		assertThat(c.get("deptName", String.class)).isEqualTo(DEPT_NAME);

		// ✅ ID 키는 없어야 한다
		assertThat(c.get("univNm")).isNull();
		assertThat(c.get("collegeNm")).isNull();
		assertThat(c.get("deptNm")).isNull();

		assertThat(c.getExpiration()).isAfter(new Date());
		assertThat(jwtUtil.isAccess(token)).isTrue();
		assertThat(jwtUtil.isRefresh(token)).isFalse();
		assertThat(jwtUtil.subjectUserNm(token)).isEqualTo("20250001");
		assertThat(jwtUtil.validateToken(token)).isTrue();
		assertThat(jwtUtil.isTokenExpired(token)).isFalse();
	}

	@Test
	@DisplayName("subjectUserNm: Subject를 정확히 반환")
	void subjectUserNm_returns_subject() {
		// AffiliationService 목
		AffiliationService aff = mock(AffiliationService.class);
		when(aff.getUniversityName(UNIV_ID)).thenReturn(UNIV_NAME);

		AuthTokenService tokenService = new AuthTokenService(jwtUtil, props, aff);

		String token = tokenService.createAccessToken(
			"kim-dev", "dev01", "ADMIN", "김개발",
			DEPT_ID, COLLEGE_ID, UNIV_ID, 3
		);

		assertThat(jwtUtil.subjectUserNm(token)).isEqualTo("kim-dev");
	}

	@Test
	@DisplayName("AuthTokenService로 생성한 RefreshToken → parse 성공 및 typ=refresh")
	void createRefreshToken_via_service_and_parse_success() {
		AffiliationService aff = mock(AffiliationService.class); // 사용 안 해도 생성자 필요
		AuthTokenService tokenService = new AuthTokenService(jwtUtil, props, aff);

		String token = tokenService.createRefreshToken("20250001", "jti-1234");

		Jws<Claims> jws = jwtUtil.parse(token);
		Claims c = jws.getPayload();

		assertThat(c.getIssuer()).isEqualTo("heycalendar");
		assertThat(c.getSubject()).isEqualTo("20250001");
		assertThat(c.getId()).isEqualTo("jti-1234");
		assertThat(c.get("typ", String.class)).isEqualTo("refresh");
		assertThat(jwtUtil.isRefresh(token)).isTrue();
		assertThat(jwtUtil.isAccess(token)).isFalse();
		assertThat(jwtUtil.validateToken(token)).isTrue();
	}

	@Test
	@DisplayName("validateToken: 형식이 잘못된 토큰은 false")
	void validateToken_malformed_returns_false() {
		String bad = "not.a.jwt.token";
		assertThat(jwtUtil.validateToken(bad)).isFalse();
	}

	@Test
	@DisplayName("isTokenExpired: 과거 만료시간으로 서명된 토큰은 만료로 판단")
	void isTokenExpired_returns_true_for_expired_token() {
		// JwtUtil의 기능만 검증(서비스 경유 X) - 과거 만료 토큰 직접 생성
		SecretKey key = Keys.hmacShaKeyFor(STRONG_SECRET.getBytes(StandardCharsets.UTF_8));
		Instant now = Instant.now();
		Date issuedAt = Date.from(now.minusSeconds(3600)); // 1시간 전
		Date expiredAt = Date.from(now.minusSeconds(10));  // 10초 전(이미 만료)

		String expiredToken = Jwts.builder()
			.issuer("heycalendar")
			.subject("만료사용자")
			.claims(Map.of("userId", "expired", "role", "STUDENT", "typ", "access"))
			.issuedAt(issuedAt)
			.expiration(expiredAt)
			.signWith(key, Jwts.SIG.HS256)
			.compact();

		assertThat(jwtUtil.validateToken(expiredToken)).isFalse(); // 파싱 시 Expired로 판단
		assertThat(jwtUtil.isTokenExpired(expiredToken)).isTrue();
	}

	@Test
	@DisplayName("약한 시크릿(32바이트 미만) 사용 시 WeakKeyException 발생")
	void weak_secret_throws_exception_on_init() {
		JwtProperties weakProps = new JwtProperties();
		weakProps.getJwt().setIssuer("heycalendar");
		weakProps.getJwt().setSecret("too-short-secret"); // 32바이트 미만 → Weak
		weakProps.getJwt().setAccessExpMin(5);
		weakProps.getJwt().setRefreshExpDays(1);

		JwtUtil util = new JwtUtil(weakProps);
		assertThatThrownBy(util::init).isInstanceOf(WeakKeyException.class);
	}
}
