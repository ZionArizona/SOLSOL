-- MySQL 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS heycalendar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE heycalendar;

-- 기존 테이블 삭제 (순서 중요 - 외래키 제약 때문에)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS application_document;
DROP TABLE IF EXISTS application;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS counseling;
DROP TABLE IF EXISTS personal_statements;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS student_cards;
DROP TABLE IF EXISTS scholarship_applications;
DROP TABLE IF EXISTS mileage;
DROP TABLE IF EXISTS exchanges;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS universities;

SET FOREIGN_KEY_CHECKS = 1;

-- 대학교 테이블
CREATE TABLE IF NOT EXISTS universities (
    university_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    university_name VARCHAR(200) NOT NULL,
    university_code VARCHAR(50) UNIQUE,
    location VARCHAR(500),
    established_year INT,
    university_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 단과대 테이블
CREATE TABLE IF NOT EXISTS colleges (
    college_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(200) NOT NULL,
    college_code VARCHAR(50),
    university_id BIGINT,
    dean_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (university_id) REFERENCES universities(university_id)
);

-- 학과 테이블
CREATE TABLE IF NOT EXISTS departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(200) NOT NULL,
    department_code VARCHAR(50),
    college_id BIGINT,
    head_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_key BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    user_nm VARCHAR(100) NOT NULL,
    user_name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    birth_date DATE,
    gender CHAR(1),
    address VARCHAR(500),
    university_id BIGINT,
    college_id BIGINT,
    department_id BIGINT,
    student_id VARCHAR(50),
    grade INT,
    gpa DECIMAL(3,2),
    income BIGINT,
    role VARCHAR(20) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (university_id) REFERENCES universities(university_id),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 장학금 테이블
CREATE TABLE IF NOT EXISTS scholarships (
    scholarship_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scholarship_name VARCHAR(200) NOT NULL,
    scholarship_type VARCHAR(50),
    provider VARCHAR(100),
    amount BIGINT,
    application_start_date DATE,
    application_end_date DATE,
    eligibility_criteria TEXT,
    required_documents TEXT,
    selection_criteria TEXT,
    university_id BIGINT,
    college_id BIGINT,
    department_id BIGINT,
    grade_requirement INT,
    gpa_requirement DECIMAL(3,2),
    income_requirement BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (university_id) REFERENCES universities(university_id),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 장학금 신청 테이블 (Application entity와 매핑)
CREATE TABLE IF NOT EXISTS application (
    user_nm VARCHAR(100) NOT NULL,
    scholarship_nm VARCHAR(200) NOT NULL,
    state VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reason TEXT,
    reviewed_by VARCHAR(100),
    PRIMARY KEY (user_nm, scholarship_nm)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 장학금 신청 서류 테이블 (ApplicationDocument entity와 매핑)
CREATE TABLE IF NOT EXISTS application_document (
    application_document_nm VARCHAR(200) NOT NULL,
    user_nm VARCHAR(100) NOT NULL,
    scholarship_nm VARCHAR(200) NOT NULL,
    file_url VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_file_name VARCHAR(300),
    file_size BIGINT,
    content_type VARCHAR(100),
    PRIMARY KEY (application_document_nm, user_nm, scholarship_nm),
    FOREIGN KEY (user_nm, scholarship_nm) REFERENCES application(user_nm, scholarship_nm)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 마일리지 테이블
CREATE TABLE IF NOT EXISTS mileage (
    mileage_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    points INT DEFAULT 0,
    source VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 마일리지 교환 테이블
CREATE TABLE IF NOT EXISTS exchanges (
    exchange_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exchange_nm VARCHAR(100) NOT NULL,
    user_nm VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    state VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 인덱스 생성
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mileage_user_key ON mileage(user_key);

-- 초기 데이터 입력
-- 대학교 데이터
INSERT INTO universities (university_name, university_code, location, established_year, university_type) VALUES
('서울대학교', 'SNU', '서울시 관악구', 1946, 'NATIONAL'),
('연세대학교', 'YU', '서울시 서대문구', 1885, 'PRIVATE'),
('고려대학교', 'KU', '서울시 성북구', 1905, 'PRIVATE'),
('KAIST', 'KAIST', '대전시 유성구', 1971, 'NATIONAL'),
('POSTECH', 'POSTECH', '경북 포항시', 1986, 'PRIVATE');

-- 단과대 데이터
INSERT INTO colleges (college_name, college_code, university_id, dean_name) VALUES
('공과대학', 'ENG', 1, '김공학'),
('경영대학', 'BUS', 1, '박경영'),
('문과대학', 'LIB', 1, '이문학'),
('의과대학', 'MED', 1, '최의학');

-- 학과 데이터
INSERT INTO departments (department_name, department_code, college_id, head_name) VALUES
('컴퓨터공학과', 'CSE', 1, '김컴퓨터'),
('전자공학과', 'EEE', 1, '박전자'),
('기계공학과', 'MEE', 1, '이기계'),
('경영학과', 'BA', 2, '최경영');

-- 사용자 테스트 데이터 (비밀번호는 "password123"을 BCrypt로 암호화한 값)
INSERT INTO users (user_id, user_nm, user_name, password, email, phone, birth_date, gender, address, university_id, college_id, department_id, student_id, grade, gpa, income, role) VALUES
('admin', 'admin', 'System Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin@solsol.com', '010-1234-5678', '1980-01-01', 'M', 'Seoul', 1, 1, 1, 'ADMIN001', 0, 4.5, 0, 'ADMIN'),
('student1', '김학생', '김철수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student1@solsol.com', '010-2345-6789', '2000-03-15', 'M', '서울시 관악구', 1, 1, 1, '2020001001', 3, 3.8, 3000000, 'STUDENT'),
('testuser', 'testuser', 'Test User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'test@solsol.com', '010-9999-9999', '2000-01-01', 'M', 'Seoul', 1, 1, 1, '2020999999', 3, 3.5, 3000000, 'STUDENT');

-- 장학금 데이터
INSERT INTO scholarships (scholarship_name, scholarship_type, provider, amount, application_start_date, application_end_date, eligibility_criteria, required_documents, selection_criteria, university_id, grade_requirement, gpa_requirement, income_requirement) VALUES
('국가우수장학금', 'MERIT', '한국장학재단', 5000000, '2024-03-01', '2024-03-31', '성적우수자', '성적증명서, 소득증명서', 'GPA 3.8 이상', 1, 2, 3.8, 5000000),
('저소득층지원장학금', 'NEED', '한국장학재단', 3000000, '2024-02-15', '2024-04-15', '저소득층 학생', '소득증명서, 가족관계증명서', '소득 분위 하위 30%', null, 1, 2.5, 3000000);

-- 장학금 신청 테스트 데이터
INSERT INTO application (user_nm, scholarship_nm, state, applied_at, reason) VALUES
('testuser', '국가우수장학금', 'PENDING', CURRENT_TIMESTAMP, '성적 우수자 장학금 신청'),
('admin', '저소득층지원장학금', 'PENDING', CURRENT_TIMESTAMP, '관리자 테스트 신청');

-- 마일리지 테스트 데이터
INSERT INTO mileage (user_key, points, source, description) VALUES
(2, 1000, 'SIGNUP', '회원가입 축하 마일리지'),
(2, 500, 'SCHOLARSHIP_APPLICATION', '장학금 신청 완료'),
(3, 1000, 'SIGNUP', '회원가입 축하 마일리지');

COMMIT;