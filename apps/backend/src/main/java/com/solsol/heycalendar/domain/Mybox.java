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
public class Mybox {
	private Long id;
	private String userNm;
	private byte[] objectKeyEnc;
	private byte[] fileNameEnc;
	private String contentType;
	private Long sizeBytes;
	private String checksumSha256;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
