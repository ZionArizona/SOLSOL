package com.solsol.heycalendar.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Long id;
    private String userNm;
    private NotificationType type;
    private String title;
    private String message;
    private Long relatedId;
    private Boolean isRead;
    private String actionRoute;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}