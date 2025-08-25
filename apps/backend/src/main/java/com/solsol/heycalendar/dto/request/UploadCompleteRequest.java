package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 클라이언트가 S3 업로드를 완료한 뒤 서버에 메타데이터를 확정 요청하는 DTO
 * 서버는 이 정보를 기반으로 DB 저장 및 감사 로그를 남김.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadCompleteRequest {
	@NotBlank
	private String objectKey;

	@NotBlank
	private String originalFilename;

	@NotBlank
	private String contentType;

	@NotNull
	@Min(1)
	private Long sizeBytes;

	private String checksumSha256;
}
