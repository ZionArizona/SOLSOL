package com.solsol.heycalendar.mapper;

import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.User;

/**
 * 사용자 조회/수정용 MyBatis 매퍼.
 */
@Mapper
public interface UserMapper {
	Optional<User> findByUserId(@Param("userId") String userId);
	Optional<User> findByUserNm(@Param("userNm") String userNm);
	Optional<User> findByUserKey(@Param("userKey") String userKey);

	int updatePasswordByUserId(@Param("userId") String userId,
		@Param("encodedPassword") String encodedPassword);

	int updateUserKeyByUserId(@Param("userId") String userId,
		@Param("userKey") String userKey);

	int clearUserKeyByUserId(@Param("userId") String userId);
	int clearUserKeyByUserKey(@Param("userKey") String userKey);

	int updateUserKeyAndAccountByUserId(@Param("userId") String userId,
		@Param("userKey") String userKey,
		@Param("accountNm") String accountNm);
	
	int insertUser(User user);
}
