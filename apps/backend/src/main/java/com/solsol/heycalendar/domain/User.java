package com.solsol.heycalendar.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
	private String userNm;
	private String accountNm;
	private String userId;
	private String password;
	private String userKey;
	private String userName;
	private State state;
	private int grade;
	private BigDecimal gpa;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Role role;

	private Long deptNm;
	private Long collegeNm;
	private Long univNm;
}
