package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeUpdateRequest {
    @NotBlank private String title;
    @NotBlank private String content;
    private String imageUrl;
}