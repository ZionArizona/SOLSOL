package com.solsol.heycalendar.common;

import java.util.List;

public record PageResponse<T>(
	List<T> content,
	int currentPage,
	int pageSize,
	long totalElements,
	int totalPages,
	boolean last
) {
	public static <T> PageResponse<T> of(List<T> content, int page, int size, long total) {
		int totalPages = (int) Math.ceil((double) total / (double) size);
		boolean last = page + 1 >= totalPages;
		return new PageResponse<>(content, page, size, total, totalPages, last);
	}
}
