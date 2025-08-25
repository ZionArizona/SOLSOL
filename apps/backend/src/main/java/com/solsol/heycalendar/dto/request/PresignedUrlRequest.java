package com.solsol.heycalendar.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PresignedUrlRequest {
	@NotBlank
	private String filename;

	@NotBlank
	private String contentType;

	@NotNull
	@Min(1)
	private Long sizeBytes;
}
