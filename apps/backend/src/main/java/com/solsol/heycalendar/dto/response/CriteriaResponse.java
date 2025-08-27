package com.solsol.heycalendar.dto.response;

import lombok.*;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class CriteriaResponse {
    private Long id;
    private String name;
    private Double stdPoint;
    private Integer weightPercent;
}