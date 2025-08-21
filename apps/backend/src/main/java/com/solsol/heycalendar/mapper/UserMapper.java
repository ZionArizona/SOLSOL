package com.solsol.heycalendar.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.User;

@Mapper
public interface UserMapper {
	User selectByUsername(@Param("username") String name);
	User selectByUserNm(@Param("userNm") Long id);
	User selectByUserId(@Param("userId") String userId);

}
