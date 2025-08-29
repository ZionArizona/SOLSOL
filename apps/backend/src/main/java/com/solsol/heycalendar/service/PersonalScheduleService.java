package com.solsol.heycalendar.service;



import com.solsol.heycalendar.dto.request.CreatePersonalScheduleRequest;
import com.solsol.heycalendar.dto.response.PersonalScheduleResponse;
import com.solsol.heycalendar.mapper.PersonalScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonalScheduleService {

    private final PersonalScheduleMapper mapper;

    @Transactional
    public void create(CreatePersonalScheduleRequest req) {
        int rows = mapper.insertByUserNm(
                req.getUserNm(),
                req.getDate(),
                req.getScheduleName(),
                req.getStartTime(),
                req.getEndTime(),
                req.getNotifyMinutes()
        );
        if (rows == 0) {
            // userNm이 user 테이블에 없을 때
            throw new IllegalArgumentException("존재하지 않는 userNm입니다: " + req.getUserNm());
        }
    }

    @Transactional(readOnly = true)
    public List<PersonalScheduleResponse> findByUserNm(String userNm) {
        return mapper.findByUserNm(userNm);
    }
    // 삭제
    @Transactional
    public int deleteByUserNmAndScheduleName(String userNm, String scheduleName) {
        return mapper.deleteByUserNmAndScheduleName(userNm, scheduleName);
    }

}