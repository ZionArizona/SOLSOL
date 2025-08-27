package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CriteriaUpdateRequest {
    @NotBlank
    private String name;
    private Double std;
    @NotNull
    @Min(0) @Max(100) private Integer weight;
}

