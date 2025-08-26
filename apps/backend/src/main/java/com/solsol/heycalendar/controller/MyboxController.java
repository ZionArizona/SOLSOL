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
import com.solsol.heycalendar.service.MyboxService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/files") // 필요시 /api/v1로 버저닝 권장
@RequiredArgsConstructor
public class MyboxController {

	private final MyboxService myboxService;

	/**
	 * 파일 업로드를 위한 Presigned URL을 발급합니다.
	 * 클라이언트는 이 URL을 사용하여 S3에 직접 파일을 업로드할 수 있습니다.
	 *
	 * @param req Presigned URL 발급 요청 DTO
	 * @param userNm 인증된 사용자 이름
	 * @return Presigned URL 정보를 담은 응답 DTO
	 */
	@PostMapping("/presigned-url")
	public PresignedUrlResponse presigned(@Valid @RequestBody PresignedUrlRequest req,
		@AuthenticationPrincipal(expression = "userNm") String userNm) {
		return myboxService.issuePresignedUrl(userNm, req);
	}

	/**
	 * 파일 업로드가 완료되었음을 서버에 알립니다.
	 * 파일 메타데이터를 DB에 저장하고, 암호화 등의 후처리를 수행합니다.
	 *
	 * @param req 업로드 완료 요청 DTO
	 * @param userNm 인증된 사용자 이름
	 * @param httpReq HttpServletRequest 객체
	 * @return 생성된 파일의 고유 ID
	 */
	@PostMapping("/complete")
	@ResponseStatus(HttpStatus.CREATED)
	public Long complete(@Valid @RequestBody UploadCompleteRequest req,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		return myboxService.completeUpload(userNm, req, httpReq);
	}

	/**
	 * 인증된 사용자의 파일 목록을 조회합니다.
	 * 페이지네이션을 지원합니다.
	 *
	 * @param page 페이지 번호 (기본값: 0)
	 * @param size 페이지 당 파일 수 (기본값: 20)
	 * @param userNm 인증된 사용자 이름
	 * @return 파일 목록 응답 DTO 리스트
	 */
	@GetMapping
	public List<MyboxResponse> list(@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@AuthenticationPrincipal(expression = "userNm") String userNm) {
		return myboxService.list(userNm, page, size);
	}

	/**
	 * 특정 파일의 상세 정보를 조회합니다.
	 * 다운로드를 위한 Presigned URL이 포함됩니다.
	 *
	 * @param fileId 조회할 파일의 ID
	 * @param userNm 인증된 사용자 이름
	 * @param httpReq HttpServletRequest 객체
	 * @return 파일 상세 정보 및 다운로드 URL을 담은 응답 DTO
	 */
	@GetMapping("/{fileId}")
	public MyboxDetailResponse get(@PathVariable Long fileId,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		return myboxService.getFileDetail(userNm, fileId, httpReq);
	}

	/**
	 * 특정 파일을 영구적으로 삭제합니다.
	 *
	 * @param fileId 삭제할 파일의 ID
	 * @param userNm 인증된 사용자 이름
	 * @param httpReq HttpServletRequest 객체
	 */
	@DeleteMapping("/{fileId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long fileId,
		@AuthenticationPrincipal(expression = "userNm") String userNm,
		HttpServletRequest httpReq) {
		myboxService.delete(userNm, fileId, httpReq);
	}
}
