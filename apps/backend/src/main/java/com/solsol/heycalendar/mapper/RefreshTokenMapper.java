package com.solsol.heycalendar.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.RefreshToken;

/**
 * 리프레시 토큰 저장/조회/무효화용 MyBatis 매퍼.
 */
@Mapper
public interface RefreshTokenMapper {
	/**
	 * 리프레시 토큰 저장(JTI 기준).
	 * @param token 토큰 엔티티
	 * @return 삽입 행 수
	 */
	int insert(RefreshToken token);

	/**
	 * 활성 상태(만료X, 취소X)의 토큰을 JTI로 조회.
	 * @param tokenJti 토큰 ID(JWT ID)
	 * @return RefreshToken 또는 null
	 */
	RefreshToken findActiveByToken(@Param("tokenJti") String tokenJti);

	/**
	 * 토큰(JTI) 무효화.
	 * @param tokenJti 토큰 ID
	 * @return 변경 행 수
	 */
	int revokeByToken(@Param("tokenJti") String tokenJti);

	/**
	 * 특정 사용자 모든 활성 토큰 무효화 (선택 사용).
	 * @param userNm 학번
	 * @return 변경 행 수
	 */
	int revokeAllByUserNm(@Param("userNm") String userNm);

	int touchLastUsed(@Param("tokenJti") String tokenJti);
}
