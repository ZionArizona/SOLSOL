package com.solsol.heycalendar.service;

import com.solsol.heycalendar.dto.request.DocumentUploadRequest;
import com.solsol.heycalendar.dto.response.DocumentUploadResponse;
import com.solsol.heycalendar.dto.response.DocumentListResponse;
import com.solsol.heycalendar.entity.Mybox;
import com.solsol.heycalendar.entity.ApplicationDocument;
import com.solsol.heycalendar.mapper.MyboxMapper;
import com.solsol.heycalendar.mapper.ApplicationDocumentMapper;
import com.solsol.heycalendar.util.CryptoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final MyboxMapper myboxMapper;
    private final ApplicationDocumentMapper applicationDocumentMapper;
    private final CryptoUtil cryptoUtil;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;

    // 지원하는 파일 타입
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
            // 이미지
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff",
            // PDF
            "application/pdf",
            // Microsoft Office
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-powerpoint", // .ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
            // 한글 파일
            "application/x-hwp", "application/haansofthwp",
            // 텍스트
            "text/plain", "text/rtf",
            // 압축 파일
            "application/zip", "application/x-rar-compressed", "application/x-7z-compressed"
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * 서류 업로드용 Presigned URL 생성 (MyBox용)
     */
    public DocumentUploadResponse generateDocumentUploadUrl(String userNm, DocumentUploadRequest request) {
        return generateUploadUrl(userNm, request, "documents");
    }

    /**
     * 장학금 신청 서류 업로드용 Presigned URL 생성
     */
    public DocumentUploadResponse generateApplicationDocumentUploadUrl(String userNm, String scholarshipNm, DocumentUploadRequest request) {
        return generateUploadUrl(userNm, request, "documents");
    }

    /**
     * 공통 업로드 URL 생성 메소드
     */
    private DocumentUploadResponse generateUploadUrl(String userNm, DocumentUploadRequest request, String folder) {
        // 파일 타입 검증
        if (!ALLOWED_DOCUMENT_TYPES.contains(request.getContentType())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다.");
        }

        // 파일 크기 검증
        if (request.getFileSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 50MB를 초과할 수 없습니다.");
        }

        try {
            // S3 객체 키 생성
            String objectKey = generateObjectKey(userNm, request.getFileName(), folder);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(request.getContentType())
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15)) // 15분 유효
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

            return DocumentUploadResponse.builder()
                    .uploadUrl(presignedRequest.url().toString())
                    .objectKey(objectKey)
                    .message("문서 업로드 URL이 생성되었습니다.")
                    .build();

        } catch (Exception e) {
            log.error("문서 업로드 Presigned URL 생성 실패 - userNm: {}", userNm, e);
            throw new RuntimeException("Presigned URL 생성에 실패했습니다.", e);
        }
    }

    /**
     * S3 객체 키 생성
     */
    private String generateObjectKey(String userNm, String originalFileName, String folder) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFileName);
        return String.format("%s/%s_%s%s", folder, uuid, timestamp, extension);
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    /**
     * 서류 업로드 완료 처리 (MyBox용)
     */
    @Transactional
    public void completeDocumentUpload(String userNm, String objectKey, DocumentUploadRequest request, String checksum) {
        completeUpload(userNm, null, null, objectKey, request, checksum, "mybox");
    }

    /**
     * 장학금 신청 서류 업로드 완료 처리
     */
    @Transactional
    public void completeApplicationDocumentUpload(String userNm, String scholarshipNm, String documentNm, String objectKey, DocumentUploadRequest request, String checksum) {
        completeUpload(userNm, scholarshipNm, documentNm, objectKey, request, checksum, "application");
    }

    /**
     * 공통 업로드 완료 처리
     */
    @Transactional
    private void completeUpload(String userNm, String scholarshipNm, String documentNm, String objectKey, DocumentUploadRequest request, String checksum, String mode) {
        // S3에서 파일 존재 확인
        if (!isFileExistsInS3(objectKey)) {
            throw new IllegalArgumentException("업로드된 파일을 찾을 수 없습니다.");
        }

        try {
            // 민감한 정보 암호화
            String encryptedObjectKey = cryptoUtil.encrypt(objectKey);
            String encryptedFileName = cryptoUtil.encrypt(request.getFileName());

            // 모드에 따라 DB에 저장
            if ("mybox".equals(mode)) {
                Mybox mybox = Mybox.builder()
                        .userNm(userNm)
                        .objectKeyEnc(encryptedObjectKey.getBytes())
                        .fileNameEnc(encryptedFileName.getBytes())
                        .contentType(request.getContentType())
                        .sizeBytes(request.getFileSize())
                        .checksumSha256(checksum)
                        .build();

                myboxMapper.insertDocument(mybox);
                log.info("MyBox 문서 업로드 완료 - userNm: {}, objectKey: {}", userNm, objectKey);
            } else if ("application".equals(mode)) {
                ApplicationDocument applicationDocument = ApplicationDocument.builder()
                        .applicationDocumentNm(null) // AUTO_INCREMENT 사용
                        .userNm(userNm)
                        .scholarshipNm(scholarshipNm)
                        .objectKeyEnc(encryptedObjectKey.getBytes())
                        .fileNameEnc(encryptedFileName.getBytes())
                        .contentType(request.getContentType())
                        .fileSize(request.getFileSize())
                        .checksumSha256(checksum)
                        .uploadedAt(java.time.LocalDateTime.now())
                        .build();

                applicationDocumentMapper.insertApplicationDocument(applicationDocument); // useGeneratedKeys=true 메서드 사용
                log.info("장학금 신청 서류 업로드 완료 - userNm: {}, scholarshipNm: {}, 생성된 documentNm: {}", userNm, scholarshipNm, applicationDocument.getApplicationDocumentNm());
            }

        } catch (Exception e) {
            log.error("문서 업로드 완료 처리 실패 - userNm: {}, objectKey: {}", userNm, objectKey, e);
            throw new RuntimeException("문서 저장에 실패했습니다.", e);
        }
    }

    /**
     * 사용자 서류 목록 조회
     */
    public List<DocumentListResponse> getUserDocuments(String userNm) {
        try {
            List<Mybox> documents = myboxMapper.findByUserNm(userNm);
            
            return documents.stream()
                    .map(doc -> {
                        try {
                            String fileName = cryptoUtil.decrypt(new String(doc.getFileNameEnc()));
                            return DocumentListResponse.builder()
                                    .id(doc.getId())
                                    .fileName(fileName)
                                    .contentType(doc.getContentType())
                                    .sizeBytes(doc.getSizeBytes())
                                    .createdAt(doc.getCreatedAt())
                                    .build();
                        } catch (Exception e) {
                            log.error("문서 정보 복호화 실패 - id: {}", doc.getId(), e);
                            return null;
                        }
                    })
                    .filter(doc -> doc != null)
                    .toList();

        } catch (Exception e) {
            log.error("사용자 서류 목록 조회 실패 - userNm: {}", userNm, e);
            throw new RuntimeException("서류 목록 조회에 실패했습니다.", e);
        }
    }

    /**
     * MyBox 서류 다운로드 URL 생성
     */
    public String generateDownloadUrl(String userNm, Long documentId) {
        try {
            Mybox document = myboxMapper.findByIdAndUserNm(documentId, userNm);
            if (document == null) {
                throw new IllegalArgumentException("문서를 찾을 수 없습니다.");
            }

            String objectKey = cryptoUtil.decrypt(new String(document.getObjectKeyEnc()));

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // 10분 유효
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            // 감사 로그 기록
            myboxMapper.insertAuditLog(documentId, userNm, "DOWNLOAD_URL_ISSUED", null, null);

            return presignedRequest.url().toString();

        } catch (Exception e) {
            log.error("다운로드 URL 생성 실패 - userNm: {}, documentId: {}", userNm, documentId, e);
            throw new RuntimeException("다운로드 URL 생성에 실패했습니다.", e);
        }
    }

    /**
     * 장학금 신청 서류 다운로드 URL 생성
     */
    public String generateApplicationDocumentDownloadUrl(String userNm, String scholarshipNm, String documentNm) {
        try {
            ApplicationDocument document = applicationDocumentMapper.findDocumentByNameAndApplication(documentNm, userNm, scholarshipNm);
            if (document == null) {
                throw new IllegalArgumentException("서류를 찾을 수 없습니다.");
            }

            String objectKey = cryptoUtil.decrypt(new String(document.getObjectKeyEnc()));

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // 10분 유효
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            return presignedRequest.url().toString();

        } catch (Exception e) {
            log.error("장학금 신청 서류 다운로드 URL 생성 실패 - userNm: {}, scholarshipNm: {}, documentNm: {}", userNm, scholarshipNm, documentNm, e);
            throw new RuntimeException("다운로드 URL 생성에 실패했습니다.", e);
        }
    }

    /**
     * 서류 삭제
     */
    @Transactional
    public void deleteDocument(String userNm, Long documentId) {
        try {
            Mybox document = myboxMapper.findByIdAndUserNm(documentId, userNm);
            if (document == null) {
                throw new IllegalArgumentException("문서를 찾을 수 없습니다.");
            }

            String objectKey = cryptoUtil.decrypt(new String(document.getObjectKeyEnc()));

            // S3에서 파일 삭제
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);

            // 감사 로그 기록
            myboxMapper.insertAuditLog(documentId, userNm, "DELETE", 
                    document.getObjectKeyEnc(), document.getFileNameEnc());

            // DB에서 삭제
            myboxMapper.deleteById(documentId);

            log.info("문서 삭제 완료 - userNm: {}, documentId: {}", userNm, documentId);

        } catch (Exception e) {
            log.error("문서 삭제 실패 - userNm: {}, documentId: {}", userNm, documentId, e);
            throw new RuntimeException("문서 삭제에 실패했습니다.", e);
        }
    }

    /**
     * MyBox 파일을 ApplicationDocument로 복사 (암호화된 데이터 그대로)
     */
    @Transactional
    public String copyMyBoxFileToApplicationDocument(String userNm, String scholarshipNm, Long myboxDocumentId) {
        try {
            log.info("MyBox 파일 복사 시작 - userNm: {}, scholarshipNm: {}, myboxDocumentId: {}", userNm, scholarshipNm, myboxDocumentId);
            
            // 디버깅: 해당 사용자의 모든 MyBox 문서 조회
            List<Mybox> userDocuments = myboxMapper.findByUserNm(userNm);
            log.info("📋 사용자 {}의 MyBox 문서 목록 ({} 개):", userNm, userDocuments.size());
            for (Mybox doc : userDocuments) {
                log.info("  - ID: {}, contentType: {}, sizeBytes: {}", doc.getId(), doc.getContentType(), doc.getSizeBytes());
            }
            
            // 1. MyBox 문서 조회
            log.info("🔍 ID {} 문서를 사용자 {}로 조회 중...", myboxDocumentId, userNm);
            Mybox myboxDocument = myboxMapper.findByIdAndUserNm(myboxDocumentId, userNm);
            if (myboxDocument == null) {
                log.error("❌ MyBox 문서 조회 실패 - ID: {}, 사용자: {}", myboxDocumentId, userNm);
                throw new IllegalArgumentException("MyBox에서 해당 문서를 찾을 수 없습니다. ID: " + myboxDocumentId + ", 사용자: " + userNm);
            }
            log.info("✅ MyBox 문서 조회 성공 - ID: {}, contentType: {}", myboxDocument.getId(), myboxDocument.getContentType());
            
            // 2. 고유한 documentNm 생성
            String documentNm = generateUniqueDocumentName(userNm, scholarshipNm);
            
            // 3. ApplicationDocument에 복사 (암호화된 데이터 그대로)
            ApplicationDocument applicationDocument = ApplicationDocument.builder()
                    .applicationDocumentNm(null) // AUTO_INCREMENT 사용
                    .userNm(userNm)
                    .scholarshipNm(scholarshipNm)
                    .objectKeyEnc(myboxDocument.getObjectKeyEnc()) // 암호화된 데이터 그대로 복사
                    .fileNameEnc(myboxDocument.getFileNameEnc()) // 암호화된 데이터 그대로 복사
                    .contentType(myboxDocument.getContentType())
                    .fileSize(myboxDocument.getSizeBytes())
                    .checksumSha256(myboxDocument.getChecksumSha256())
                    .uploadedAt(java.time.LocalDateTime.now())
                    .build();
            
            applicationDocumentMapper.insertDocument(applicationDocument);
            
            // 4. 복호화한 파일명으로 로깅
            try {
                String originalFileName = cryptoUtil.decrypt(new String(myboxDocument.getFileNameEnc()));
                log.info("✅ MyBox 파일 복사 완료 - documentNm: {}, 원본 파일명: {}", documentNm, originalFileName);
            } catch (Exception e) {
                log.info("✅ MyBox 파일 복사 완료 - documentNm: {} (파일명 복호화 실패)", documentNm);
            }
            
            return documentNm;
            
        } catch (Exception e) {
            log.error("❌ MyBox 파일 복사 실패 - userNm: {}, scholarshipNm: {}, myboxDocumentId: {}", userNm, scholarshipNm, myboxDocumentId, e);
            throw new RuntimeException("MyBox 파일 복사에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 고유한 document 이름 생성
     */
    private String generateUniqueDocumentName(String userNm, String scholarshipNm) {
        long timestamp = System.currentTimeMillis();
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("mybox_%s_%s_%s", userNm, timestamp, uuid);
    }

    /**
     * S3에서 파일 존재 확인
     */
    private boolean isFileExistsInS3(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("S3 파일 존재 확인 실패 - key: {}", key, e);
            return false;
        }
    }
}
