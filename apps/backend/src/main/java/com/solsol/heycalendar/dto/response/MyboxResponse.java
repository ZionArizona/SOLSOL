package com.solsol.heycalendar.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyboxResponse {

	private Long myboxId;
	
	private String fileName;

	private String contentType;

	private Long sizeBytes;

	private LocalDateTime createdAt;
}
