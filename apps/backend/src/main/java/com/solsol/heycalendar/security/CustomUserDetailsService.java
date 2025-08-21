package com.solsol.heycalendar.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.solsol.heycalendar.domain.User;
import com.solsol.heycalendar.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final UserMapper userMapper;

	@Override
	public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
		User user = userMapper.findByUserId(userId)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

		return CustomUserPrincipal.create(user);
	}
}
