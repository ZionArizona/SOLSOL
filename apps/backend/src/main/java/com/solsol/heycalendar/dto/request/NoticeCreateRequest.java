package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeCreateRequest {
    @NotBlank private String title;
    @NotBlank private String content;
    private String imageUrl;
    private Integer orderNo; // null이면 맨뒤
}