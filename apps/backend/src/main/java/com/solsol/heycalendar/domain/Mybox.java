package com.solsol.heycalendar.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Mybox(개인 파일 저장소)에 저장된 파일의 메타데이터를 나타내는 도메인 클래스입니다.
 * 파일 이름, S3 객체 키 등 민감한 정보는 암호화하여 저장됩니다.
 */
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
