package com.solsol.heycalendar.service.storage;

public interface ObjectStorageClient {
	String issuePutPresignedUrl(String objectKey, String contentType, int expiresInSeconds);

	String issueGetPresignedUrl(String objectKey, int expiresInSeconds);

	void deleteObject(String objectKey);
}
