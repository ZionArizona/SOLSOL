package com.solsol.heycalendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.solsol.heycalendar.dto.request.PresignedUrlRequest;
import com.solsol.heycalendar.dto.request.UploadCompleteRequest;
import com.solsol.heycalendar.dto.response.MyboxDetailResponse;
import com.solsol.heycalendar.dto.response.MyboxResponse;
import com.solsol.heycalendar.dto.response.PresignedUrlResponse;
import com.solsol.heycalendar.mybox.service.MyboxService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/files") // 필요시 /api/v1로 버저닝 권장
@RequiredArgsConstructor
public class MyboxController {

	private final MyboxService myboxService;

	/** 업로드 Presigned URL 발급 */
	@PostMapping("/presigned-url")
	public PresignedUrlResponse presigned(@Valid @RequestBody PresignedUrlRequest req,
		@AuthenticationPrincipal(expression = "userNm") String userNm) {
		return myboxService.issuePresignedUrl(userNm, req);
	}

	/** 업로드 완료 확정 */
	@PostMapping("/complete")
	@ResponseStatus(HttpStatus.CREATED)
	public Long complete(@Valid @RequestBody UploadCompleteRequest req,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		return myboxService.completeUpload(userNm, req, httpReq);
	}

	/** 내 파일 목록 */
	@GetMapping
	public List<MyboxResponse> list(@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@AuthenticationPrincipal(expression = "userNm") String userNm) {
		return myboxService.list(userNm, page, size);
	}

	/** 파일 상세(다운로드 URL 포함) */
	@GetMapping("/{fileId}")
	public MyboxDetailResponse get(@PathVariable Long fileId,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		return myboxService.getFileDetail(userNm, fileId, httpReq);
	}

	/** 삭제(즉시 영구 삭제) */
	@DeleteMapping("/{fileId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long fileId,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		myboxService.delete(userNm, fileId, httpReq);
	}
}
