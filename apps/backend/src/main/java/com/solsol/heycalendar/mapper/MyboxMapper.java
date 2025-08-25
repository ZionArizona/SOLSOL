package com.solsol.heycalendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.solsol.heycalendar.domain.Mybox;

@Mapper
public interface MyboxMapper {
	int insert(Mybox file);

	Mybox selectByIdAndUser(@Param("id") Long id, @Param("userNm") String userNm);

	List<Mybox> selectPageByUser(@Param("userNm") String userNm, @Param("limit") int limit,
		@Param("offset") int offset);

	long countByUser(@Param("userNm") String userNm);

	int deleteByIdAndUser(@Param("id") Long id, @Param("userNm") String userNm);
}
