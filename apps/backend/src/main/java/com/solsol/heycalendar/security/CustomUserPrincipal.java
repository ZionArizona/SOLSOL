package com.solsol.heycalendar.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.solsol.heycalendar.domain.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Spring Security의 UserDetails 인터페이스를 구현한 클래스
 * 인증된 사용자의 주요 정보를 나타내며, SecurityContext에 저장
 */
@Getter
@AllArgsConstructor
public class CustomUserPrincipal implements UserDetails {
	private String userNm;
	private String userId;
	private String password;
	private String userName;
	private String role;

	private Long deptNm;       // 학과 (BIGINT)
	private Long collegeNm;    // 단과대학 (BIGINT)
	private Long univNm;       // 대학교 (BIGINT)
	private Integer grade;     // 학년 (INT)

	/**
	 * User 엔티티 객체를 기반으로 CustomUserPrincipal 객체를 생성
	 *
	 * @param user 사용자 엔티티
	 * @return 생성된 CustomUserPrincipal 객체
	 */
	public static CustomUserPrincipal create(User user) {
		return new CustomUserPrincipal(user.getUserNm(), user.getUserId(), user.getPassword(), user.getUserName(),
			user.getRole() != null ? user.getRole().name() : "STUDENT",
			user.getDeptNm(),
			user.getCollegeNm(),
			user.getUnivNm(),
			user.getGrade());
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return userNm;  // 학번 반환 (MyBox에서 userNm으로 사용하기 위해)
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
