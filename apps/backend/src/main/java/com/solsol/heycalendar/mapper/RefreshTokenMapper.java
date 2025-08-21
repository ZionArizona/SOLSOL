package com.solsol.heycalendar.mapper;

import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.RefreshToken;

public interface RefreshTokenMapper {
	int insert(RefreshToken token);
	RefreshToken findActiveByToken(@Param("token") String token);
	int revokeByToken(@Param("token") String token);
	int revokeAllByUser(@Param("userNm") Long userNm);
	int touchLastUsed(@Param("token") String token);
}
