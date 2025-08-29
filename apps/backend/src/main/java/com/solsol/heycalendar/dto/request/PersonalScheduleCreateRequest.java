package com.solsol.heycalendar.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
public class PersonalScheduleCreateRequest {

    /** 누가 저장하는지 식별 (현재 스키마: user.userNm 참조) */
    @NotBlank(message = "userNm은 필수입니다.")
    @Size(max = 64, message = "userNm은 64자 이하여야 합니다.")
    private String userNm;

    /** YYYY-MM-DD */
    @NotNull(message = "date는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank(message = "일정 제목은 필수입니다.")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
    private String scheduleName;

    /** HH:mm (24h) */
    @NotNull(message = "startTime은 필수입니다.")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    /** HH:mm (24h) */
    @NotNull(message = "endTime은 필수입니다.")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    /** 분 단위 (0=없음, 5/10/30/60 등) */
    @NotNull
    @Min(0) @Max(720)
    private Integer notifyMinutes = 0;
}