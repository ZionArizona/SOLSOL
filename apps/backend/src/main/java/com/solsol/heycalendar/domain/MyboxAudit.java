package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyboxAudit {
	private Long id;
	private Long myboxId;
	private String actorUserNm;
	private String action;
	private byte[] objectKeyEnc;
	private byte[] fileNameEnc;
	private Long sizeBytes;
	private String checksumSha256;
	private String s3Etag;
	private String s3VersionId;
	private String actorIp;
	private String userAgent;
	private String detail;
	private LocalDateTime createdAt;
}
