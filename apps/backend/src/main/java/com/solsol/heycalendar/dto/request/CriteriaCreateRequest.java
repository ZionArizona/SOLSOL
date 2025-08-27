package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CriteriaCreateRequest {
    @NotBlank private String name;
    private Double std;                    // nullable
    @NotNull @Min(0) @Max(100) private Integer weight; // %
    private Integer orderNo;               // null이면 맨뒤
}

