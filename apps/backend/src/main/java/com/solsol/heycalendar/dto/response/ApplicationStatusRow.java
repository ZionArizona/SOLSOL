package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.domain.ApplicationStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 신청 상태 배치 조회 결과 행
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusRow {
	private Long scholarshipId;
	private ApplicationStatus state;
}
