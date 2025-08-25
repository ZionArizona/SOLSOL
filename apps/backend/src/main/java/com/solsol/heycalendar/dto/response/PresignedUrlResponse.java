package com.solsol.heycalendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업로드용(HTTP PUT) Presigned URL 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {
	private String uploadUrl;

	private String objectKey;

	private Integer expiresInSeconds;
}
