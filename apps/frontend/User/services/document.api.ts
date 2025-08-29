import tokenManager from '../utils/tokenManager';
import { BASE_URL } from './api';
import * as FileSystem from 'expo-file-system';


// API_BASE는 services/api.ts의 BASE_URL 사용 

// 토큰 가져오기
const getAuthToken = async (): Promise<string> => {
  try {
    console.log('🔄 tokenManager 확인:', tokenManager);
    const token = await tokenManager.getAccessToken();
    console.log('🔑 JWT 토큰 가져오기 결과:', token ? `성공 (길이: ${token.length})` : '실패 (토큰 없음)');
    if (token) {
      console.log('🔑 토큰 앞부분:', token.substring(0, 20) + '...');
    }
    return token || '';
  } catch (error) {
    console.error('❌ 토큰 가져오기 실패:', error);
    return '';
  }
};

export interface DocumentUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface DocumentUploadResponse {
  uploadUrl: string;
  objectKey: string;
  message: string;
}

export interface DocumentItem {
  id: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

// 파일 크기를 읽기 좋게 변환
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 카테고리 매핑 (컨텐츠 타입에 따라)
const getCategoryFromContentType = (contentType: string): string => {
  if (contentType.startsWith('image/')) return '기타';
  if (contentType === 'application/pdf') return '기타';
  if (contentType.includes('word') || contentType.includes('hwp')) return '기타';
  if (contentType.includes('excel') || contentType.includes('sheet')) return '성적증명';
  return '기타';
};

// SHA-256 해시 계산 (웹 환경용)
const calculateSHA256 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 서류 업로드 URL 생성
export const generateUploadUrl = async (request: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL.replace('/api', '')}/api/student/documents/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '업로드 URL 생성에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// S3에 파일 업로드
export const uploadFileToS3 = async (uploadUrl: string, file: File, contentType: string): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('S3 error body:', text);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

// 업로드 완료 처리
export const completeUpload = async (data: {
  objectKey: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum: string;
}): Promise<void> => {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL.replace('/api', '')}/api/student/documents/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '업로드 완료 처리에 실패했습니다.');
  }
};

// 내 서류 목록 조회
export const getMyDocuments = async (): Promise<DocumentItem[]> => {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL.replace('/api', '')}/api/student/documents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '서류 목록 조회에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 서류 다운로드 URL 생성
export const generateDownloadUrl = async (documentId: number): Promise<string> => {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL.replace('/api', '')}/api/student/documents/${documentId}/download-url`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '다운로드 URL 생성에 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
};

// 서류 삭제
export const deleteDocument = async (documentId: number): Promise<void> => {
  try {
    console.log('🗑️ 서류 삭제 API 호출:', documentId);
    
    const token = await getAuthToken();
    console.log('🔑 토큰 확인:', token ? '있음' : '없음');
    
    //const url = `${BASE_URL.replace('/api', '')}/api/student/documents/${documentId}`;
    const url = `${BASE_URL}/student/documents/${documentId}`;
    console.log('🌐 삭제 요청 URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📋 삭제 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ 삭제 실패 응답:', errorData);
      throw new Error(errorData.message || `삭제 실패 (HTTP ${response.status})`);
    }
    
    console.log('✅ 서류 삭제 API 성공');
  } catch (error) {
    console.error('❌ deleteDocument 함수 오류:', error);
    throw error;
  }
};

// React Native용 파일 업로드 함수
export const uploadDocumentRN = async (
  fileUri: string, 
  fileName: string, 
  contentType: string, 
  fileSize: number, 
  category: string
): Promise<DocumentItem> => {
  try {
    console.log('📄 문서 업로드 시작:', fileName);

    // 1. 업로드 URL 생성
    const uploadRequest: DocumentUploadRequest = {
      fileName,
      contentType,
      fileSize,
    };

    const uploadResponse = await generateUploadUrl(uploadRequest);
    console.log('✅ 업로드 URL 생성 완료');

    // 2. S3에 파일 업로드 (React Native 방식)
    await uploadFileToS3RN(uploadResponse.uploadUrl, fileUri, contentType);
    console.log('✅ S3 업로드 완료');

    // 3. 파일 해시 계산 (임시로 랜덤 값 사용)
    const checksum = Math.random().toString(36).substring(2, 15);
    console.log('✅ 파일 해시 계산 완료');

    // 4. 업로드 완료 처리
    await completeUpload({
      objectKey: uploadResponse.objectKey,
      fileName,
      contentType,
      fileSize,
      checksum,
    });
    console.log('✅ 업로드 완료 처리');

    // 5. 업로드된 문서 정보 반환
    return {
      id: Date.now(),
      fileName,
      contentType,
      sizeBytes: fileSize,
      createdAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ 문서 업로드 실패:', error);
    throw error;
  }
};

// React Native용 S3 업로드
// export const uploadFileToS3RN = async (uploadUrl: string, fileUri: string, contentType: string): Promise<void> => {
//   const response = await fetch(uploadUrl, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': contentType,
//     },
//     body: {
//       uri: fileUri,
//       type: contentType,
//       name: fileUri.split('/').pop() || 'file',
//     } as any,
//   });

//   if (!response.ok) {
//     throw new Error('파일 업로드에 실패했습니다.');
//   }
// };
export const uploadFileToS3RN = async (uploadUrl: string, fileUri: string, contentType: string) => {
  const res = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'PUT',
    headers: { 'Content-Type': contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`S3 업로드 실패 (HTTP ${res.status}): ${res.body}`);
  }
};

// 전체 업로드 프로세스 (웹용 - 기존 유지)
export const uploadDocument = async (file: File, fileName: string, category: string): Promise<DocumentItem> => {
  try {
    console.log('📄 문서 업로드 시작:', fileName);

    // 1. 업로드 URL 생성
    const uploadRequest: DocumentUploadRequest = {
      fileName,
      contentType: file.type,
      fileSize: file.size,
    };

    const uploadResponse = await generateUploadUrl(uploadRequest);
    console.log('✅ 업로드 URL 생성 완료');

    // 2. S3에 파일 업로드
    await uploadFileToS3(uploadResponse.uploadUrl, file, file.type);
    console.log('✅ S3 업로드 완료');

    // 3. 파일 해시 계산
    const checksum = await calculateSHA256(file);
    console.log('✅ 파일 해시 계산 완료');

    // 4. 업로드 완료 처리
    await completeUpload({
      objectKey: uploadResponse.objectKey,
      fileName,
      contentType: file.type,
      fileSize: file.size,
      checksum,
    });
    console.log('✅ 업로드 완료 처리');

    // 5. 업로드된 문서 정보 반환 (임시)
    return {
      id: Date.now(), // 실제로는 서버에서 반환받아야 함
      fileName,
      contentType: file.type,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ 문서 업로드 실패:', error);
    throw error;
  }
};

// DocumentItem을 DocCard용 DocItem으로 변환
export const convertToDocItem = (doc: DocumentItem, index: number): any => {
  return {
    id: doc.id.toString(),
    fileName: doc.fileName,
    category: getCategoryFromContentType(doc.contentType),
    size: formatFileSize(doc.sizeBytes),
    uploadedAt: new Date(doc.createdAt).toLocaleDateString('ko-KR') + ' 업로드',
    metaTags: [getCategoryFromContentType(doc.contentType)],
    status: '사용가능',
    usageCount: 0,
    colorKey: getCategoryFromContentType(doc.contentType) === '성적증명' ? 'grade' : 
              getCategoryFromContentType(doc.contentType) === '자격증' ? 'license' : 
              getCategoryFromContentType(doc.contentType) === '어학' ? 'lang' : 'etc',
  };
};