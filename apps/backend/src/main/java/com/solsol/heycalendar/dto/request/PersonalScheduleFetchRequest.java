package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PersonalScheduleFetchRequest {
    @NotBlank(message = "userNm은 필수입니다.")
    private String userNm;
}