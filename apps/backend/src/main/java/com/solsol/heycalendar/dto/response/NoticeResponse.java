package com.solsol.heycalendar.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class NoticeResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
}
