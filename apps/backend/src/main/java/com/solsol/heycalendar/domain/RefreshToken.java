package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
	private Long userNm;
	private String userId;
	private String token;
	private LocalDateTime issuedAt;
	private LocalDateTime expiresAt;
	private boolean revoked;
	private String userAgent;
	private String ip;
	private String rotatedFrom;
	private LocalDateTime lastUsedAt;
}
