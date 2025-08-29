package com.solsol.heycalendar.dto.response;

import com.solsol.heycalendar.domain.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipWithStateResponse {
	private ScholarshipResponse scholarship;
	private ApplicationStatus state;
}
