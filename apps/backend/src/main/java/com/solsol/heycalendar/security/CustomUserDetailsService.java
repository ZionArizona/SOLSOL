package com.solsol.heycalendar.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security의 UserDetailsService 인터페이스를 구현한 클래스
 * 사용자 ID를 기반으로 데이터베이스에서 사용자 정보를 조회
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final UserMapper userMapper;

	/**
	 * 사용자 ID를 사용하여 사용자 정보를 로드하고, Spring Security가 사용할 수 있는 UserDetails 객체로 변환
	 *
	 * @param userId 조회할 사용자의 ID
	 * @return 조회된 사용자의 정보를 담은 UserDetails 객체
	 * @throws UsernameNotFoundException 해당 ID의 사용자를 찾을 수 없을 경우
	 */
	@Override
	public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
		User user = userMapper.findByUserId(userId)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

		return CustomUserPrincipal.create(user);
	}
}
