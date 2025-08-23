package com.solsol.heycalendar.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AuthException.class)
	public ResponseEntity<?> handleAuthException(AuthException e) {
		return ResponseEntity
			.status(e.getErrorCode().getStatus())
			.body(new ErrorResponse(e.getErrorCode().getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleGenericException(Exception e) {
		return ResponseEntity
			.status(500)
			.body(new ErrorResponse("서버 내부 오류가 발생했습니다."));
	}

	record ErrorResponse(String message) {}
}
