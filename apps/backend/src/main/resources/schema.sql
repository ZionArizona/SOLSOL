-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_key BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    user_nm VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    address TEXT,
    university_id BIGINT,
    college_id BIGINT,
    department_id BIGINT,
    student_id VARCHAR(20),
    grade INTEGER,
    gpa DECIMAL(3,2),
    income BIGINT,
    role VARCHAR(20) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 대학교 테이블
CREATE TABLE IF NOT EXISTS universities (
    university_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    university_name VARCHAR(100) NOT NULL,
    university_code VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(100),
    established_year INTEGER,
    university_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 단과대 테이블
CREATE TABLE IF NOT EXISTS colleges (
    college_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(100) NOT NULL,
    college_code VARCHAR(20) NOT NULL,
    university_id BIGINT NOT NULL,
    dean_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (university_id) REFERENCES universities(university_id)
);

-- 학과 테이블
CREATE TABLE IF NOT EXISTS departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    college_id BIGINT NOT NULL,
    head_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
);

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
    grade_requirement INTEGER,
    gpa_requirement DECIMAL(3,2),
    income_requirement BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (university_id) REFERENCES universities(university_id),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- 장학금 신청 테이블
CREATE TABLE IF NOT EXISTS scholarship_applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    scholarship_id BIGINT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    submitted_documents TEXT,
    notes TEXT,
    review_date TIMESTAMP,
    reviewer_id BIGINT,
    amount_awarded BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_key) REFERENCES users(user_key),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id)
);

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
);

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
);

-- 마일리지 테이블
CREATE TABLE IF NOT EXISTS mileage (
    mileage_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    points INTEGER DEFAULT 0,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),
    description TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 추천서 테이블
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    recommender_name VARCHAR(100),
    recommender_position VARCHAR(100),
    recommender_email VARCHAR(100),
    recommender_phone VARCHAR(20),
    relationship VARCHAR(50),
    content TEXT,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 자기소개서 테이블
CREATE TABLE IF NOT EXISTS personal_statements (
    statement_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    title VARCHAR(200),
    content TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 학생증 테이블
CREATE TABLE IF NOT EXISTS student_cards (
    card_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    card_number VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    card_status VARCHAR(20) DEFAULT 'ACTIVE',
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 결제 테이블
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    description TEXT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 상담 테이블
CREATE TABLE IF NOT EXISTS counseling (
    counseling_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    counselor_id BIGINT,
    counseling_type VARCHAR(50),
    topic VARCHAR(200),
    content TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    scheduled_date TIMESTAMP,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 리프레시 토큰 테이블
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_key BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_key) REFERENCES users(user_key)
);

-- 인덱스 생성
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scholarship_applications_user_key ON scholarship_applications(user_key);
CREATE INDEX idx_scholarship_applications_scholarship_id ON scholarship_applications(scholarship_id);
CREATE INDEX idx_mileage_user_key ON mileage(user_key);
CREATE INDEX idx_notifications_user_key ON notifications(user_key);
CREATE INDEX idx_refresh_tokens_user_key ON refresh_tokens(user_key);