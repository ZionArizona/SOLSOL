# SOLSOL API 명세서

## 목차
1. [인증 관리](#1-인증-관리)
2. [사용자 관리](#2-사용자-관리)
3. [장학금 관리](#3-장학금-관리)
4. [신청서 관리](#4-신청서-관리)
5. [마일리지 관리](#5-마일리지-관리)
6. [서류 보관함](#6-서류-보관함)
7. [공지사항](#7-공지사항)
8. [알림](#8-알림)
9. [캘린더](#9-캘린더)
10. [대학 관리](#10-대학-관리)
11. [관리자 기능](#11-관리자-기능)
12. [금융 API (내부)](#12-금융-api-내부)

---

## Base URL
```
Production: https://api.solsol.com
Development: http://localhost:8080/api
```

## 인증
모든 API 요청(로그인, 회원가입 제외)은 Authorization 헤더에 Bearer 토큰이 필요합니다.
```
Authorization: Bearer {access_token}
```

---

## 1. 인증 관리

### 1.1 로그인 ✅
**POST** `/auth/login`

사용자 로그인 후 액세스 토큰과 리프레시 토큰을 발급합니다.

**Request Body:**
```json
{
  "userId": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "code": "OK",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

### 1.2 로그아웃 ✅
**POST** `/auth/logout`

리프레시 토큰을 무효화하여 로그아웃 처리합니다.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful.",
  "code": "OK",
  "data": null
}
```

### 1.3 토큰 재발급 ✅
**POST** `/auth/refresh`

만료된 액세스 토큰을 재발급합니다.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully.",
  "code": "OK",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

### 1.4 비밀번호 재설정 요청 ❌
**POST** `/auth/password/reset/request`

비밀번호 재설정 이메일을 발송합니다.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent.",
  "code": "OK",
  "data": {
    "email": "string",
    "expiredAt": "2024-12-31T23:59:59Z"
  }
}
```

### 1.5 비밀번호 재설정 확정 ❌
**POST** `/auth/password/reset/confirm`

이메일로 받은 토큰으로 비밀번호를 재설정합니다.

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "code": "OK",
  "data": null
}
```

---

## 2. 사용자 관리

### 2.1 회원가입 ❌
**POST** `/user/regist`

새로운 사용자를 등록합니다.

**Request Body:**
```json
{
  "userId": "string",
  "password": "string",
  "userName": "string",
  "email": "string",
  "grade": 1,
  "gpa": 4.5,
  "deptNm": 1,
  "collegeNm": 1,
  "univNm": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "code": "CREATED",
  "data": {
    "userNm": 1,
    "userId": "string",
    "userName": "string",
    "email": "string",
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

### 2.2 사용자 정보 조회 ❌
**GET** `/user/info`

현재 로그인한 사용자 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "User info retrieved successfully.",
  "code": "OK",
  "data": {
    "userNm": 1,
    "userId": "string",
    "userName": "string",
    "email": "string",
    "grade": 4,
    "gpa": 4.3,
    "status": "ACTIVE",
    "role": "USER",
    "department": {
      "deptNm": 1,
      "deptName": "컴퓨터공학과"
    },
    "college": {
      "collegeNm": 1,
      "collegeName": "공과대학"
    },
    "university": {
      "univNm": 1,
      "univName": "한양대학교"
    }
  }
}
```

### 2.3 사용자 정보 수정 ❌
**PUT** `/user/info`

사용자 정보를 수정합니다.

**Request Body:**
```json
{
  "userName": "string",
  "email": "string",
  "grade": 4,
  "gpa": 4.3,
  "deptNm": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User info updated successfully.",
  "code": "OK",
  "data": {
    "userNm": 1,
    "userName": "string",
    "email": "string",
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 2.4 회원 탈퇴 ❌
**DELETE** `/user/delete`

회원 탈퇴를 처리합니다.

**Request Body:**
```json
{
  "password": "string",
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully.",
  "code": "OK",
  "data": null
}
```

### 2.5 이메일 인증 발송 ❌
**POST** `/user/verify/send`

이메일 인증 메일을 발송합니다.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent.",
  "code": "OK",
  "data": {
    "email": "string",
    "expiredAt": "2024-12-31T23:59:59Z"
  }
}
```

### 2.6 이메일 인증 확인 ❌
**POST** `/user/verify/check`

이메일 인증 코드를 확인합니다.

**Request Body:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "code": "OK",
  "data": {
    "verified": true
  }
}
```

### 2.7 비밀번호 변경 ❌
**PUT** `/user/update`

사용자 비밀번호를 변경합니다.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully.",
  "code": "OK",
  "data": null
}
```

---

## 3. 장학금 관리

### 3.1 장학금 목록 조회 ✅
**GET** `/scholarships`

장학금 목록을 조회합니다. 검색과 필터링을 지원합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호 (기본값: 0)
- `size` (integer): 페이지 크기 (기본값: 10)
- `search` (string): 검색어
- `status` (string): 상태 필터 (OPEN, CLOSED, PENDING)
- `startDate` (string): 시작일 필터 (yyyy-MM-dd)
- `endDate` (string): 종료일 필터 (yyyy-MM-dd)

**Response:**
```json
{
  "success": true,
  "message": "Scholarships retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "scholarshipNm": 1,
        "title": "2024년 1학기 성적우수 장학금",
        "description": "성적이 우수한 학생에게 지급하는 장학금",
        "amount": 3000000,
        "startDate": "2024-03-01",
        "endDate": "2024-03-31",
        "status": "OPEN",
        "reviewDuration": 14
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0
  }
}
```

### 3.2 장학금 상세 조회 ✅
**GET** `/scholarships/{scholarshipId}`

특정 장학금의 상세 정보를 조회합니다.

**Path Parameters:**
- `scholarshipId` (integer): 장학금 ID

**Response:**
```json
{
  "success": true,
  "message": "Scholarship retrieved successfully.",
  "code": "OK",
  "data": {
    "scholarshipNm": 1,
    "title": "2024년 1학기 성적우수 장학금",
    "description": "성적이 우수한 학생에게 지급하는 장학금",
    "amount": 3000000,
    "startDate": "2024-03-01",
    "endDate": "2024-03-31",
    "status": "OPEN",
    "reviewDuration": 14,
    "eligibilities": [
      {
        "eligibilityNm": 1,
        "field": "GPA",
        "operator": "GREATER_THAN",
        "value": "3.5"
      }
    ],
    "documents": [
      {
        "documentNm": 1,
        "documentName": "성적증명서",
        "isRequired": true
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "createdBy": 1
  }
}
```

### 3.3 장학금 등록 (관리자) ✅
**POST** `/admin/scholarships`

새로운 장학금을 등록합니다.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "amount": 3000000,
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "reviewDuration": 14,
  "eligibilities": [
    {
      "field": "GPA",
      "operator": "GREATER_THAN",
      "value": "3.5"
    }
  ],
  "documents": [
    {
      "documentName": "성적증명서",
      "isRequired": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scholarship created successfully.",
  "code": "CREATED",
  "data": {
    "scholarshipNm": 1,
    "title": "string",
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

### 3.4 장학금 수정 (관리자) ✅
**PUT** `/admin/scholarships/{scholarshipId}`

장학금 정보를 수정합니다.

**Path Parameters:**
- `scholarshipId` (integer): 장학금 ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "amount": 3000000,
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "reviewDuration": 14
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scholarship updated successfully.",
  "code": "OK",
  "data": {
    "scholarshipNm": 1,
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 3.5 장학금 삭제 (관리자) ✅
**DELETE** `/admin/scholarships/{scholarshipId}`

장학금을 삭제합니다.

**Path Parameters:**
- `scholarshipId` (integer): 장학금 ID

**Response:**
```json
{
  "success": true,
  "message": "Scholarship deleted successfully.",
  "code": "OK",
  "data": null
}
```

### 3.6 장학금 상태 변경 (관리자) ❌
**PUT** `/admin/scholarships/{scholarshipId}/status`

장학금 모집 상태를 변경합니다.

**Path Parameters:**
- `scholarshipId` (integer): 장학금 ID

**Request Body:**
```json
{
  "status": "CLOSED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scholarship status updated successfully.",
  "code": "OK",
  "data": {
    "scholarshipNm": 1,
    "status": "CLOSED",
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 4. 신청서 관리

### 4.1 내 신청 목록 조회 ✅
**GET** `/applications/me`

현재 사용자의 장학금 신청 목록을 조회합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기
- `status` (string): 상태 필터 (PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "applicationNm": 1,
        "scholarshipNm": 1,
        "scholarshipTitle": "2024년 1학기 성적우수 장학금",
        "status": "PENDING",
        "appliedAt": "2024-03-15T10:00:00Z",
        "reviewedAt": null
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

### 4.2 신청서 작성 ✅
**POST** `/applications`

장학금 신청서를 제출합니다.

**Request Body:**
```json
{
  "scholarshipNm": 1,
  "documents": [
    {
      "documentNm": 1,
      "fileUrl": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully.",
  "code": "CREATED",
  "data": {
    "applicationNm": 1,
    "scholarshipNm": 1,
    "status": "PENDING",
    "appliedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 4.3 신청서 상세 조회 ✅
**GET** `/applications/{applicationId}`

특정 신청서의 상세 정보를 조회합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Response:**
```json
{
  "success": true,
  "message": "Application retrieved successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "scholarshipNm": 1,
    "scholarshipTitle": "2024년 1학기 성적우수 장학금",
    "userNm": 1,
    "userName": "김소연",
    "status": "PENDING",
    "appliedAt": "2024-03-15T10:00:00Z",
    "reviewedAt": null,
    "reviewerComment": null,
    "documents": [
      {
        "documentNm": 1,
        "documentName": "성적증명서",
        "fileUrl": "string",
        "uploadedAt": "2024-03-15T09:50:00Z"
      }
    ]
  }
}
```

### 4.4 신청 취소 ✅
**DELETE** `/applications/{applicationId}/cancel`

장학금 신청을 취소합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Response:**
```json
{
  "success": true,
  "message": "Application cancelled successfully.",
  "code": "OK",
  "data": null
}
```

### 4.5 신청 진행현황 조회 ✅
**GET** `/applications/{applicationId}/status`

신청서 진행 상태를 조회합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Response:**
```json
{
  "success": true,
  "message": "Application status retrieved successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "status": "PENDING",
    "statusHistory": [
      {
        "status": "SUBMITTED",
        "changedAt": "2024-03-15T10:00:00Z",
        "comment": "신청서가 제출되었습니다."
      },
      {
        "status": "PENDING",
        "changedAt": "2024-03-15T10:01:00Z",
        "comment": "검토 대기 중입니다."
      }
    ]
  }
}
```

### 4.6 신청서류 첨부 ✅
**POST** `/applications/{applicationId}/documents`

신청서에 서류를 첨부합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Request Body:**
```json
{
  "documentNm": 1,
  "fileUrl": "string",
  "source": "VAULT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "document attached successfully.",
  "code": "OK",
  "data": {
    "documentNm": 1,
    "attachedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 4.7 신청서 수정 ❌
**PUT** `/applications/{applicationId}`

접수 기간 내에 신청서를 수정합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Request Body:**
```json
{
  "documents": [
    {
      "documentNm": 1,
      "fileUrl": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application updated successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 5. 마일리지 관리

### 5.1 내 마일리지 잔액 조회 ✅
**GET** `/mileage/balance`

현재 사용자의 마일리지 잔액을 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "Mileage balance retrieved successfully.",
  "code": "OK",
  "data": {
    "userNm": 1,
    "totalMileage": 4000,
    "availableMileage": 4000,
    "pendingMileage": 0
  }
}
```

### 5.2 마일리지 거래내역 조회 ✅
**GET** `/mileage/transactions`

마일리지 거래 내역을 조회합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기
- `startDate` (string): 시작일
- `endDate` (string): 종료일

**Response:**
```json
{
  "success": true,
  "message": "Mileage transactions retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "key": 1,
        "amount": 1000,
        "type": "EARNED",
        "description": "장학금 승인",
        "balance": 5000,
        "createdAt": "2024-03-20T10:00:00Z"
      },
      {
        "key": 2,
        "amount": -1000,
        "type": "EXCHANGED",
        "description": "현금 환전",
        "balance": 4000,
        "createdAt": "2024-03-25T10:00:00Z"
      }
    ],
    "totalElements": 20,
    "totalPages": 2,
    "currentPage": 0
  }
}
```

### 5.3 환전 신청 ✅
**POST** `/mileage/exchange/request`

마일리지를 현금으로 환전 신청합니다.

**Request Body:**
```json
{
  "amount": 1000,
  "accountNumber": "110-123-456789",
  "bankName": "국민은행"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange request submitted successfully.",
  "code": "CREATED",
  "data": {
    "exchangeNm": 1,
    "amount": 1000,
    "status": "PENDING",
    "requestedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 5.4 환전 신청 조회 ✅
**GET** `/mileage/exchange/{exchangeId}`

특정 환전 신청 내역을 조회합니다.

**Path Parameters:**
- `exchangeId` (integer): 환전 신청 ID

**Response:**
```json
{
  "success": true,
  "message": "Exchange request retrieved successfully.",
  "code": "OK",
  "data": {
    "exchangeNm": 1,
    "userNm": 1,
    "amount": 1000,
    "accountNumber": "110-123-456789",
    "bankName": "국민은행",
    "status": "PENDING",
    "requestedAt": "2024-03-25T10:00:00Z",
    "processedAt": null,
    "rejectReason": null
  }
}
```

### 5.5 환전 승인 (관리자) ✅
**PUT** `/admin/mileage/exchange/{exchangeId}/approve`

환전 신청을 승인합니다.

**Path Parameters:**
- `exchangeId` (string): 환전 신청 ID

**Request Body:**
```json
{
  "adminComment": "승인되었습니다."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange approved successfully.",
  "code": "OK",
  "data": {
    "exchangeNm": "1",
    "status": "APPROVED",
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 5.6 환전 반려 (관리자) ✅
**PUT** `/admin/mileage/exchange/{exchangeId}/reject`

환전 신청을 반려합니다.

**Path Parameters:**
- `exchangeId` (string): 환전 신청 ID

**Request Body:**
```json
{
  "rejectReason": "계좌 정보 불일치"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rejected successfully.",
  "code": "OK",
  "data": {
    "exchangeNm": "1",
    "status": "REJECTED",
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 5.7 마일리지 지급 (관리자) ❌
**POST** `/admin/mileage/award`

사용자에게 마일리지를 지급합니다.

**Request Body:**
```json
{
  "userNm": 1,
  "amount": 1000,
  "description": "장학금 승인"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mileage awarded successfully.",
  "code": "OK",
  "data": {
    "key": 1,
    "userNm": 1,
    "amount": 1000,
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 6. 서류 보관함

### 6.1 보관함 파일 목록 조회 ❌
**GET** `/vault/files`

사용자의 보관함 파일 목록을 조회합니다.

**Query Parameters:**
- `category` (string): 파일 카테고리 (activity, certificate, transcript)
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "fileId": "uuid",
        "fileName": "성적증명서.pdf",
        "fileSize": 1024000,
        "category": "transcript",
        "uploadedAt": "2024-03-01T10:00:00Z",
        "expiresAt": "2025-03-01T10:00:00Z"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

### 6.2 보관함 파일 단건 조회 ❌
**GET** `/vault/files/{fileId}`

특정 파일 정보를 조회합니다.

**Path Parameters:**
- `fileId` (string): 파일 ID

**Response:**
```json
{
  "success": true,
  "message": "File retrieved successfully.",
  "code": "OK",
  "data": {
    "fileId": "uuid",
    "fileName": "성적증명서.pdf",
    "fileSize": 1024000,
    "category": "transcript",
    "uploadedAt": "2024-03-01T10:00:00Z",
    "expiresAt": "2025-03-01T10:00:00Z",
    "downloadUrl": "https://storage.solsol.com/files/uuid"
  }
}
```

### 6.3 보관함 파일 삭제 ❌
**DELETE** `/vault/files/{fileId}`

보관함 파일을 삭제합니다.

**Path Parameters:**
- `fileId` (string): 파일 ID

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully.",
  "code": "OK",
  "data": null
}
```

### 6.4 파일 업로드 URL 요청 ❌
**POST** `/vault/files/presigned-url`

파일 업로드를 위한 Presigned URL을 요청합니다.

**Request Body:**
```json
{
  "fileName": "성적증명서.pdf",
  "fileSize": 1024000,
  "category": "transcript"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Presigned URL generated successfully.",
  "code": "OK",
  "data": {
    "uploadUrl": "https://storage.solsol.com/upload/uuid",
    "fileId": "uuid",
    "expiresIn": 3600
  }
}
```

### 6.5 파일 업로드 완료 ❌
**POST** `/vault/files/complete`

파일 업로드 완료를 알립니다.

**Request Body:**
```json
{
  "fileId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File upload completed successfully.",
  "code": "OK",
  "data": {
    "fileId": "uuid",
    "fileName": "성적증명서.pdf",
    "uploadedAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 7. 공지사항

### 7.1 공지사항 목록 조회 ❌
**GET** `/api/notice`

공지사항 목록을 조회합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기
- `category` (string): 카테고리 필터

**Response:**
```json
{
  "success": true,
  "message": "Notices retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "noticeId": 1,
        "title": "2024년 1학기 장학금 안내",
        "category": "SCHOLARSHIP",
        "isImportant": true,
        "createdAt": "2024-03-01T10:00:00Z",
        "viewCount": 150
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0
  }
}
```

### 7.2 공지사항 상세 조회 ❌
**GET** `/api/notice/{noticeId}`

특정 공지사항의 상세 내용을 조회합니다.

**Path Parameters:**
- `noticeId` (integer): 공지사항 ID

**Response:**
```json
{
  "success": true,
  "message": "Notice retrieved successfully.",
  "code": "OK",
  "data": {
    "noticeId": 1,
    "title": "2024년 1학기 장학금 안내",
    "content": "상세 내용...",
    "category": "SCHOLARSHIP",
    "isImportant": true,
    "attachments": [
      {
        "fileId": "uuid",
        "fileName": "안내문.pdf"
      }
    ],
    "createdAt": "2024-03-01T10:00:00Z",
    "updatedAt": null,
    "viewCount": 151
  }
}
```

### 7.3 공지사항 작성 (관리자) ❌
**POST** `/api/notice`

새로운 공지사항을 작성합니다.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category": "SCHOLARSHIP",
  "isImportant": true,
  "attachments": ["fileId1", "fileId2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notice created successfully.",
  "code": "CREATED",
  "data": {
    "noticeId": 1,
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

### 7.4 공지사항 수정 (관리자) ❌
**PUT** `/api/notice/{noticeId}`

공지사항을 수정합니다.

**Path Parameters:**
- `noticeId` (integer): 공지사항 ID

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category": "SCHOLARSHIP",
  "isImportant": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notice updated successfully.",
  "code": "OK",
  "data": {
    "noticeId": 1,
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 7.5 공지사항 삭제 (관리자) ❌
**DELETE** `/api/notice/{noticeId}`

공지사항을 삭제합니다.

**Path Parameters:**
- `noticeId` (integer): 공지사항 ID

**Response:**
```json
{
  "success": true,
  "message": "Notice deleted successfully.",
  "code": "OK",
  "data": null
}
```

---

## 8. 알림

### 8.1 내 알림함 목록 조회 ❌
**GET** `/notifications`

사용자의 알림 목록을 조회합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기
- `isRead` (boolean): 읽음 상태 필터

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "notificationId": 1,
        "type": "APPLICATION",
        "title": "장학금 신청 승인",
        "message": "2024년 1학기 성적우수 장학금이 승인되었습니다.",
        "isRead": false,
        "createdAt": "2024-03-20T10:00:00Z",
        "relatedId": 1,
        "relatedType": "SCHOLARSHIP"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "unreadCount": 3
  }
}
```

### 8.2 알림 읽음 처리 ❌
**PUT** `/notifications/{notificationId}/read`

알림을 읽음 처리합니다.

**Path Parameters:**
- `notificationId` (integer): 알림 ID

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read.",
  "code": "OK",
  "data": {
    "notificationId": 1,
    "readAt": "2024-12-31T23:59:59Z"
  }
}
```

### 8.3 알림 발송 (관리자) ❌
**POST** `/admin/notifications/send`

특정 조건의 사용자에게 알림을 발송합니다.

**Request Body:**
```json
{
  "title": "string",
  "message": "string",
  "type": "SYSTEM",
  "targetFilter": {
    "grade": [3, 4],
    "department": [1, 2],
    "userIds": ["user1", "user2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent successfully.",
  "code": "OK",
  "data": {
    "sentCount": 150,
    "sentAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 9. 캘린더

### 9.1 통합 캘린더 조회 ❌
**GET** `/calendar/events`

개인 일정과 장학금 일정을 통합 조회합니다.

**Query Parameters:**
- `startDate` (string): 시작일 (yyyy-MM-dd)
- `endDate` (string): 종료일 (yyyy-MM-dd)
- `category` (string): 카테고리 필터 (PERSONAL, SCHOLARSHIP, EXAM)

**Response:**
```json
{
  "success": true,
  "message": "Calendar events retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "eventId": 1,
      "title": "성적우수 장학금 마감",
      "description": "신청 마감일",
      "category": "SCHOLARSHIP",
      "startDate": "2024-03-31",
      "endDate": "2024-03-31",
      "isAllDay": true,
      "color": "#FF5733",
      "relatedId": 1,
      "relatedType": "SCHOLARSHIP"
    },
    {
      "eventId": 2,
      "title": "중간고사",
      "description": "2024년 1학기 중간고사",
      "category": "EXAM",
      "startDate": "2024-04-15",
      "endDate": "2024-04-19",
      "isAllDay": true,
      "color": "#3498DB"
    }
  ]
}
```

### 9.2 개인 일정 등록 ❌
**POST** `/calendar/events`

개인 일정을 등록합니다.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "PERSONAL",
  "startDate": "2024-04-01",
  "endDate": "2024-04-01",
  "startTime": "14:00",
  "endTime": "16:00",
  "isAllDay": false,
  "color": "#2ECC71",
  "reminder": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully.",
  "code": "CREATED",
  "data": {
    "eventId": 3,
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

### 9.3 개인 일정 수정 ❌
**PUT** `/calendar/events/{eventId}`

개인 일정을 수정합니다.

**Path Parameters:**
- `eventId` (integer): 일정 ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "startDate": "2024-04-01",
  "endDate": "2024-04-01",
  "startTime": "15:00",
  "endTime": "17:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully.",
  "code": "OK",
  "data": {
    "eventId": 3,
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 9.4 개인 일정 삭제 ❌
**DELETE** `/calendar/events/{eventId}`

개인 일정을 삭제합니다.

**Path Parameters:**
- `eventId` (integer): 일정 ID

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully.",
  "code": "OK",
  "data": null
}
```

### 9.5 장학 일정 자동연동 ❌
**POST** `/calendar/scholarships/{scholarshipId}/follow`

장학금 일정을 캘린더에 자동 연동합니다.

**Path Parameters:**
- `scholarshipId` (integer): 장학금 ID

**Response:**
```json
{
  "success": true,
  "message": "Scholarship calendar synced successfully.",
  "code": "OK",
  "data": {
    "eventId": 4,
    "scholarshipId": 1,
    "syncedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 9.6 카테고리 목록 조회 ❌
**GET** `/calendar/categories`

캘린더 카테고리 목록을 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "categoryId": 1,
      "name": "개인",
      "code": "PERSONAL",
      "color": "#2ECC71",
      "isDefault": true
    },
    {
      "categoryId": 2,
      "name": "장학금",
      "code": "SCHOLARSHIP",
      "color": "#FF5733",
      "isDefault": true
    },
    {
      "categoryId": 3,
      "name": "시험",
      "code": "EXAM",
      "color": "#3498DB",
      "isDefault": true
    }
  ]
}
```

---

## 10. 대학 관리

### 10.1 대학 목록 조회 ✅
**GET** `/api/universities`

대학 목록을 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "Universities retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "univNm": 1,
      "univName": "한양대학교",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 10.2 단과대학 목록 조회 ✅
**GET** `/api/colleges`

특정 대학의 단과대학 목록을 조회합니다.

**Query Parameters:**
- `univNm` (integer): 대학 ID

**Response:**
```json
{
  "success": true,
  "message": "Colleges retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "collegeNm": 1,
      "collegeName": "공과대학",
      "univNm": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 10.3 학과 목록 조회 ✅
**GET** `/api/departments`

특정 단과대학의 학과 목록을 조회합니다.

**Query Parameters:**
- `collegeNm` (integer): 단과대학 ID

**Response:**
```json
{
  "success": true,
  "message": "Departments retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "deptNm": 1,
      "deptName": "컴퓨터공학과",
      "collegeNm": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 10.4 학교별 마일리지 정책 조회 ❌
**GET** `/admin/universities/{univId}/policy`

학교별 마일리지 정책을 조회합니다.

**Path Parameters:**
- `univId` (integer): 대학 ID

**Response:**
```json
{
  "success": true,
  "message": "Policy retrieved successfully.",
  "code": "OK",
  "data": {
    "univNm": 1,
    "conversionRate": 10,
    "minimumExchange": 1000,
    "maximumExchange": 100000,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 10.5 학교별 마일리지 정책 수정 ❌
**PUT** `/admin/universities/{univId}/policy`

학교별 마일리지 정책을 수정합니다.

**Path Parameters:**
- `univId` (integer): 대학 ID

**Request Body:**
```json
{
  "conversionRate": 10,
  "minimumExchange": 1000,
  "maximumExchange": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Policy updated successfully.",
  "code": "OK",
  "data": {
    "univNm": 1,
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 11. 관리자 기능

### 11.1 통합 대시보드 ❌
**GET** `/admin/dashboard`

관리자 대시보드 요약 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully.",
  "code": "OK",
  "data": {
    "summary": {
      "totalUsers": 1000,
      "activeScholarships": 5,
      "pendingApplications": 50,
      "totalMileageIssued": 1000000
    },
    "recentApplications": [
      {
        "applicationNm": 1,
        "userName": "김소연",
        "scholarshipTitle": "성적우수 장학금",
        "appliedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "statistics": {
      "applicationsByStatus": {
        "PENDING": 50,
        "APPROVED": 200,
        "REJECTED": 30
      },
      "mileageByMonth": [
        {
          "month": "2024-01",
          "issued": 100000,
          "exchanged": 50000
        }
      ]
    }
  }
}
```

### 11.2 통계 및 리포트 ❌
**GET** `/admin/statistics`

상세 통계 및 리포트를 조회합니다.

**Query Parameters:**
- `startDate` (string): 시작일
- `endDate` (string): 종료일
- `type` (string): 통계 유형 (APPLICATION, MILEAGE, USER)

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully.",
  "code": "OK",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "applicationStatistics": {
      "total": 500,
      "approved": 300,
      "rejected": 50,
      "pending": 150,
      "approvalRate": 85.7
    },
    "mileageStatistics": {
      "totalIssued": 1000000,
      "totalExchanged": 500000,
      "averagePerUser": 1000
    },
    "userStatistics": {
      "totalUsers": 1000,
      "activeUsers": 800,
      "newUsers": 100
    }
  }
}
```

### 11.3 신청서 목록 조회 (관리자) ✅
**GET** `/admin/applications`

모든 신청서를 조회합니다.

**Query Parameters:**
- `page` (integer): 페이지 번호
- `size` (integer): 페이지 크기
- `status` (string): 상태 필터
- `scholarshipNm` (integer): 장학금 ID
- `userNm` (integer): 사용자 ID

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully.",
  "code": "OK",
  "data": {
    "content": [
      {
        "applicationNm": 1,
        "userNm": 1,
        "userName": "김소연",
        "scholarshipNm": 1,
        "scholarshipTitle": "성적우수 장학금",
        "status": "PENDING",
        "appliedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0
  }
}
```

### 11.4 신청서 승인 (관리자) ✅
**PUT** `/admin/applications/{applicationId}/approve`

신청서를 승인합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Request Body:**
```json
{
  "adminComment": "승인되었습니다.",
  "awardMileage": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application approved successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "status": "APPROVED",
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 11.5 신청서 반려 (관리자) ✅
**PUT** `/admin/applications/{applicationId}/reject`

신청서를 반려합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Request Body:**
```json
{
  "rejectReason": "서류 미비"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application rejected successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "status": "REJECTED",
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 11.6 보완 요청 (관리자) ❌
**PUT** `/admin/applications/{applicationId}/request-more`

신청서에 대해 추가 서류를 요청합니다.

**Path Parameters:**
- `applicationId` (integer): 신청서 ID

**Request Body:**
```json
{
  "requestMessage": "성적증명서를 다시 제출해주세요.",
  "requiredDocuments": ["성적증명서"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Additional documents requested successfully.",
  "code": "OK",
  "data": {
    "applicationNm": 1,
    "status": "PENDING_DOCUMENTS",
    "requestedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 11.7 권한 목록 조회 ❌
**GET** `/auth/roles`

시스템 권한 목록을 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully.",
  "code": "OK",
  "data": [
    {
      "roleId": 1,
      "roleName": "USER",
      "description": "일반 사용자"
    },
    {
      "roleId": 2,
      "roleName": "ADMIN",
      "description": "관리자"
    },
    {
      "roleId": 3,
      "roleName": "SUPER_ADMIN",
      "description": "최고 관리자"
    }
  ]
}
```

### 11.8 권한 부여/변경 ❌
**PUT** `/auth/roles/{userId}`

사용자의 권한을 변경합니다.

**Path Parameters:**
- `userId` (string): 사용자 ID

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully.",
  "code": "OK",
  "data": {
    "userId": "string",
    "role": "ADMIN",
    "updatedAt": "2024-12-31T23:59:59Z"
  }
}
```

---

## 12. 금융 API (내부)

### 12.1 금융 계정 생성 ❌
**POST** `/internal/banking/accounts`

사용자의 금융 계정을 생성합니다.

**Request Body:**
```json
{
  "userNm": 1,
  "accountType": "STUDENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "code": "CREATED",
  "data": {
    "accountId": "uuid",
    "accountNumber": "110-123-456789",
    "createdAt": "2024-12-31T23:59:59Z"
  }
}
```

### 12.2 계좌 입금 처리 ❌
**POST** `/internal/banking/deposit`

환전 승인 시 계좌에 입금을 처리합니다.

**Request Body:**
```json
{
  "accountNumber": "110-123-456789",
  "amount": 10000,
  "description": "마일리지 환전"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit processed successfully.",
  "code": "OK",
  "data": {
    "transactionId": "uuid",
    "status": "COMPLETED",
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 12.3 입금 상태 조회 ❌
**GET** `/internal/banking/transfers/{transferId}`

입금 처리 상태를 조회합니다.

**Path Parameters:**
- `transferId` (string): 거래 ID

**Response:**
```json
{
  "success": true,
  "message": "Transfer status retrieved successfully.",
  "code": "OK",
  "data": {
    "transferId": "uuid",
    "status": "COMPLETED",
    "amount": 10000,
    "processedAt": "2024-12-31T23:59:59Z"
  }
}
```

### 12.4 입금 결과 웹훅 ❌
**POST** `/internal/banking/webhooks/deposit`

금융 API로부터 입금 결과를 수신합니다.

**Request Body:**
```json
{
  "transactionId": "uuid",
  "status": "SUCCESS",
  "amount": 10000,
  "accountNumber": "110-123-456789",
  "processedAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received successfully.",
  "code": "OK",
  "data": null
}
```

### 12.5 API Key 상태 확인 ❌
**GET** `/internal/banking/apikey`

금융 API Key의 상태를 확인합니다.

**Response:**
```json
{
  "success": true,
  "message": "API key status retrieved successfully.",
  "code": "OK",
  "data": {
    "status": "ACTIVE",
    "expiresAt": "2025-12-31T23:59:59Z",
    "remainingCalls": 10000
  }
}
```

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 실패 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스를 찾을 수 없음 |
| 409 | Conflict - 중복된 리소스 |
| 422 | Unprocessable Entity - 유효성 검증 실패 |
| 500 | Internal Server Error - 서버 오류 |

**에러 응답 형식:**
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "이메일 형식이 올바르지 않습니다."
    }
  ]
}
```

---

## 구현 상태 요약

### ✅ 구현 완료 (17개)
- 인증: 로그인, 로그아웃, 토큰 재발급
- 장학금: CRUD, 자격요건, 필요서류 관리
- 신청서: 신청, 조회, 취소, 상태 관리, 서류 첨부
- 마일리지: 조회, 추가, 환전 신청/승인/반려
- 대학: 대학/단과대/학과 조회

### ❌ 미구현 (54개)
- 사용자: 회원가입, 정보 조회/수정, 탈퇴, 이메일 인증, 비밀번호 관리
- 서류 보관함: 업로드, 조회, 삭제
- 공지사항: CRUD
- 알림: 조회, 읽음 처리, 발송
- 캘린더: 일정 CRUD, 장학금 연동
- 관리자: 대시보드, 통계, 정책 관리
- 금융 API: 계좌 관리, 입금 처리

---

## 다음 단계 권장사항

1. **우선순위 높음**
   - 사용자 관리 API (회원가입, 로그인 필수)
   - 서류 보관함 (장학금 신청 시 필요)
   - 알림 시스템 (사용자 경험 향상)

2. **우선순위 중간**
   - 캘린더 기능
   - 공지사항
   - 관리자 대시보드

3. **우선순위 낮음**
   - 금융 API 연동
   - 상세 통계 기능
