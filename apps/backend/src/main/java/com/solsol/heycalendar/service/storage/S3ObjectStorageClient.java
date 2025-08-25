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

@Component  // 스프링 빈 등록
@RequiredArgsConstructor
public class S3ObjectStorageClient implements ObjectStorageClient {

	private final S3Presigner presigner;
	private final S3Client s3Client;
	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

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

	@Override
	public void deleteObject(String objectKey) {
		DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)
			.build();

		s3Client.deleteObject(deleteRequest);
	}
}
