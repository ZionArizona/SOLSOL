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
	User selectByUsername(@Param("username") String name);
	User selectByUserNm(@Param("userNm") Long id);
	User selectByUserId(@Param("userId") String userId);

	/**
	 * userId(로그인 ID)로 사용자 단건 조회.
	 * @param userId 로그인 ID
	 * @return Optional<User>
	 */
	Optional<User> findByUserId(@Param("userId") String userId);

	/**
	 * 학번(userNm)으로 사용자 단건 조회.
	 * @param userNm 학번
	 * @return Optional<User>
	 */
	Optional<User> findByUserNm(@Param("userNm") String userNm);

	Optional<User> findByUserKey(@Param("userKey") String userKey);

	/**
	 * 로그인 ID로 비밀번호 해시 수정.
	 * @param userId 로그인 ID
	 * @param encodedPassword 암호화된 비밀번호(BCrypt/Argon2 등)
	 * @return 변경 행 수
	 */
	int updatePasswordByUserId(@Param("userId") String userId,
		@Param("encodedPassword") String encodedPassword);

	/**
	 * 비밀번호 재설정용 임시 코드(userKey) 저장.
	 * @param userId 로그인 ID
	 * @param userKey 임시 코드(예: 6자리)
	 * @return 변경 행 수
	 */
	int updateUserKeyByUserId(@Param("userId") String userId,
		@Param("userKey") String userKey);

	/**
	 * 비밀번호 재설정 완료 후 userKey 제거.
	 * @param userId 로그인 ID
	 * @return 변경 행 수
	 */
	int clearUserKeyByUserId(@Param("userId") String userId);

	int clearUserKeyByUserKey(@Param("userKey") String userKey);
}
