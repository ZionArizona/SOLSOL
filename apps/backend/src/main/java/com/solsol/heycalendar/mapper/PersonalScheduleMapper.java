package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.dto.request.CreatePersonalScheduleRequest;
import com.solsol.heycalendar.dto.response.PersonalScheduleResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.*;

@Mapper
public interface PersonalScheduleMapper {
    int insertByUserNm(
            @Param("userNm") String userNm,
            @Param("scheduleDate") String scheduleDate,
            @Param("scheduleName") String scheduleName,
            @Param("startTime") String startTime,
            @Param("endTime") String endTime,
            @Param("notifyMinutes") Integer notifyMinutes
    );

    int insert(CreatePersonalScheduleRequest req);
    // 조회
    List<PersonalScheduleResponse> findByUserNm(@Param("userNm") String userNm);

    // 삭제
    int deleteByUserNmAndScheduleName( @Param("userNm") String userNm, @Param("scheduleName") String scheduleName);
}