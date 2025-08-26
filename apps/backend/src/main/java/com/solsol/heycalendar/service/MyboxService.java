package com.solsol.heycalendar.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solsol.heycalendar.domain.Mybox;
import com.solsol.heycalendar.domain.MyboxAudit;
import com.solsol.heycalendar.dto.request.PresignedUrlRequest;
import com.solsol.heycalendar.dto.request.UploadCompleteRequest;
import com.solsol.heycalendar.dto.response.MyboxDetailResponse;
import com.solsol.heycalendar.dto.response.MyboxResponse;
import com.solsol.heycalendar.dto.response.PresignedUrlResponse;
import com.solsol.heycalendar.mapper.MyboxAuditMapper;
import com.solsol.heycalendar.mapper.MyboxMapper;
import com.solsol.heycalendar.service.crypto.CryptoService;
import com.solsol.heycalendar.service.storage.ObjectStorageClient;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyboxService {

	private static final int UPLOAD_URL_TTL = 120;
	private static final int DOWNLOAD_URL_TTL = 120;

	private final MyboxMapper myboxMapper;
	private final MyboxAuditMapper auditMapper;
	private final ObjectStorageClient storage;
	private final CryptoService crypto;

	/**
	 * Presigned URL 발급
	 */
	public PresignedUrlResponse issuePresignedUrl(String userNm, PresignedUrlRequest req) {
		String objectKey = buildObjectKey(userNm, req.getFilename());
		String url = storage.issuePutPresignedUrl(objectKey, req.getContentType(), UPLOAD_URL_TTL);

		return PresignedUrlResponse.builder()
			.uploadUrl(url)
			.objectKey(objectKey)
			.expiresInSeconds(UPLOAD_URL_TTL)
			.build();
	}

	/**
	 * 업로드 완료 확정
	 */
	@Transactional
	public Long completeUpload(String userNm, UploadCompleteRequest req, HttpServletRequest httpReq) {
		Mybox file = Mybox.builder()
			.userNm(userNm)
			.objectKeyEnc(crypto.encryptToBytes(req.getObjectKey()))
			.fileNameEnc(crypto.encryptToBytes(req.getOriginalFilename()))
			.contentType(req.getContentType())
			.sizeBytes(req.getSizeBytes())
			.checksumSha256(req.getChecksumSha256())
			.build();

		myboxMapper.insert(file);

		MyboxAudit auditLog = MyboxAudit.builder()
			.myboxId(file.getId())
			.actorUserNm(userNm)
			.action("CREATE")
			.objectKeyEnc(file.getObjectKeyEnc())
			.fileNameEnc(file.getFileNameEnc())
			.sizeBytes(file.getSizeBytes())
			.checksumSha256(file.getChecksumSha256())
			.actorIp(clientIp(httpReq))
			.userAgent(httpReq.getHeader("User-Agent"))
			.createdAt(LocalDateTime.now())
			.build();

		auditMapper.insert(auditLog);

		return file.getId();
	}

	/**
	 * 사용자 파일 목록 조회
	 */
	public List<MyboxResponse> list(String userNm, int page, int size) {
		int limit = Math.max(1, size);
		int offset = Math.max(0, page) * limit;

		return myboxMapper.selectPageByUser(userNm, limit, offset).stream()
			.map(this::toRes)
			.toList();
	}

	/**
	 * 파일 상세 조회 (Presigned GET URL 포함)
	 */
	public MyboxDetailResponse getFileDetail(String userNm, Long fileId, HttpServletRequest httpReq) {
		Mybox file = myboxMapper.selectByIdAndUser(fileId, userNm);
		if (file == null) {
			throw new IllegalArgumentException("file not found");
		}

		String objectKey = crypto.decryptToString(file.getObjectKeyEnc());
		String fileName = crypto.decryptToString(file.getFileNameEnc());
		String presignedUrl = storage.issueGetPresignedUrl(objectKey, DOWNLOAD_URL_TTL);

		MyboxAudit auditLog = MyboxAudit.builder()
			.myboxId(file.getId())
			.actorUserNm(userNm)
			.action("DOWNLOAD_URL_ISSUED")
			.objectKeyEnc(file.getObjectKeyEnc())
			.fileNameEnc(file.getFileNameEnc())
			.sizeBytes(file.getSizeBytes())
			.checksumSha256(file.getChecksumSha256())
			.actorIp(clientIp(httpReq))
			.userAgent(httpReq.getHeader("User-Agent"))
			.createdAt(LocalDateTime.now())
			.build();
		auditMapper.insert(auditLog);

		return MyboxDetailResponse.builder()
			.myboxId(file.getId())
			.fileName(fileName)
			.contentType(file.getContentType())
			.sizeBytes(file.getSizeBytes())
			.createdAt(file.getCreatedAt())
			.downloadUrl(presignedUrl)
			.expiresInSeconds(DOWNLOAD_URL_TTL)
			.build();
	}

	/**
	 * 파일 삭제 (S3 + DB + Audit 로그)
	 */
	@Transactional
	public void delete(String userNm, Long fileId, HttpServletRequest httpReq) {
		Mybox file = myboxMapper.selectByIdAndUser(fileId, userNm);
		if (file == null) {
			return;
		}

		String objectKey = crypto.decryptToString(file.getObjectKeyEnc());
		storage.deleteObject(objectKey);                     // S3 삭제
		myboxMapper.deleteByIdAndUser(fileId, userNm);       // DB 삭제

		MyboxAudit auditLog = MyboxAudit.builder()
			.myboxId(fileId)
			.actorUserNm(userNm)
			.action("DELETE")
			.objectKeyEnc(file.getObjectKeyEnc())
			.fileNameEnc(file.getFileNameEnc())
			.sizeBytes(file.getSizeBytes())
			.checksumSha256(file.getChecksumSha256())
			.actorIp(clientIp(httpReq))
			.userAgent(httpReq.getHeader("User-Agent"))
			.createdAt(LocalDateTime.now())
			.build();
		auditMapper.insert(auditLog);
	}

	private String clientIp(HttpServletRequest req) {
		String h = req.getHeader("X-Forwarded-For");
		return (h != null && !h.isBlank()) ? h.split(",")[0].trim() : req.getRemoteAddr();
	}

	private String buildObjectKey(String userNm, String filename) {
		// 예: mybox/{userNm}/yyyy/MM/dd/{uuid}-{sanitized}
		String safe = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
		return "mybox/%s/%tY/%<tm/%<td/%s-%s"
			.formatted(userNm, Instant.now(), UUID.randomUUID(), safe);
	}

	private MyboxResponse toRes(Mybox file) {
		String fileName = crypto.decryptToString(file.getFileNameEnc());
		return MyboxResponse.builder()
			.myboxId(file.getId())
			.fileName(fileName)
			.contentType(file.getContentType())
			.sizeBytes(file.getSizeBytes())
			.createdAt(file.getCreatedAt())
			.build();
	}
}
