package com.solsol.heycalendar.service.storage;

import java.net.URL;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

/**
 * AWS S3를 object storage로 사용하는 클라이언트 클래스입니다.
 * 이 클래스는 {@link ObjectStorageClient} 인터페이스를 구현하며,
 * 파일 업로드/다운로드를 위한 Presigned URL 발급 및 파일 삭제 기능을 제공합니다.
 */
@Component  // 스프링 빈 등록
@RequiredArgsConstructor
public class S3ObjectStorageClient implements ObjectStorageClient {

	private final S3Presigner presigner;
	private final S3Client s3Client;

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

	/**
	 * 파일을 S3에 업로드하기 위한 Presigned URL을 생성합니다.
	 *
	 * @param objectKey S3에 저장될 객체의 키
	 * @param contentType 업로드될 파일의 MIME 타입
	 * @param expiresInSeconds URL의 유효 시간 (초)
	 * @return 생성된 Presigned URL 문자열
	 */
	@Override
	public String issuePutPresignedUrl(String objectKey, String contentType, int expiresInSeconds) {
		PutObjectRequest putRequest = PutObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)
			.contentType(contentType)
			.build();

		PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
			.signatureDuration(Duration.ofSeconds(expiresInSeconds))
			.putObjectRequest(putRequest)
			.build();

		URL presignedUrl = presigner.presignPutObject(presignRequest).url();
		return presignedUrl.toString();
	}

	/**
	 * S3에 저장된 파일을 다운로드하기 위한 Presigned URL을 생성합니다.
	 *
	 * @param objectKey S3에 저장된 객체의 키
	 * @param expiresInSeconds URL의 유효 시간 (초)
	 * @return 생성된 Presigned URL 문자열
	 */
	@Override
	public String issueGetPresignedUrl(String objectKey, int expiresInSeconds) {
		GetObjectRequest getRequest = GetObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)
			.build();

		GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
			.signatureDuration(Duration.ofSeconds(expiresInSeconds))
			.getObjectRequest(getRequest)
			.build();

		URL presignedUrl = presigner.presignGetObject(presignRequest).url();
		return presignedUrl.toString();
	}

	/**
	 * S3에서 특정 객체를 삭제합니다.
	 *
	 * @param objectKey 삭제할 객체의 키
	 */
	@Override
	public void deleteObject(String objectKey) {
		DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)
			.build();

		s3Client.deleteObject(deleteRequest);
	}
}
