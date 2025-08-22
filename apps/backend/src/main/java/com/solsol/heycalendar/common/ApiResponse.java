package com.solsol.heycalendar.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
	private boolean success;
	private String message;
	private String code;
	private T data;

	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(true, "OK", "OK", data);
	}
	public static <T> ApiResponse<T> error(String message, String code) {
		return new ApiResponse<>(false, message, code, null);
	}
}
