-- ApplicationDocument 테이블 스키마 업데이트
-- 기존 컬럼 삭제 (있다면)
ALTER TABLE applicationdocument 
DROP COLUMN IF EXISTS file_url,
DROP COLUMN IF EXISTS original_file_name;

-- 새로운 암호화 컬럼 추가
ALTER TABLE applicationdocument 
ADD COLUMN IF NOT EXISTS object_key_enc VARBINARY(512) COMMENT '암호화된 S3 객체 키',
ADD COLUMN IF NOT EXISTS file_name_enc VARBINARY(512) COMMENT '암호화된 파일명',
ADD COLUMN IF NOT EXISTS checksum_sha256 VARCHAR(64) COMMENT '파일 무결성 검증용 SHA-256 해시';

-- 기존 데이터가 있다면 백업하고 새로운 스키마로 마이그레이션
-- (필요시 데이터 마이그레이션 로직 추가)

-- 현재 테이블 구조 확인
DESCRIBE applicationdocument;

-- =====================================================
-- 마일리지 테이블 수정: 장학금별 마일리지 지급 추적
-- =====================================================

-- 마일리지 테이블에 장학금 추적을 위한 컬럼 추가
ALTER TABLE mileage 
ADD COLUMN scholarshipNm BIGINT NULL COMMENT '장학금 식별자',
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '마일리지 지급 시간',
ADD COLUMN reason VARCHAR(255) DEFAULT '장학금 마일리지 지급' COMMENT '마일리지 지급 사유';

-- 같은 사용자가 같은 장학금에 대해 중복 지급받는 것을 방지하는 유니크 제약조건 추가
-- (scholarshipNm이 NULL이 아닌 경우만 적용)
ALTER TABLE mileage 
ADD CONSTRAINT unique_user_scholarship_mileage 
UNIQUE (userNm, scholarshipNm);

-- 외래키 제약조건 추가 (선택사항 - 데이터 무결성 강화)
-- ALTER TABLE mileage 
-- ADD CONSTRAINT fk_mileage_scholarship 
-- FOREIGN KEY (scholarshipNm) REFERENCES scholarship(id);