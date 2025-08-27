-- 알림 테이블 생성
CREATE TABLE notification (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_nm VARCHAR(20) NOT NULL,
    type ENUM('SCHOLARSHIP_RESULT', 'DEADLINE_REMINDER', 'NEW_SCHOLARSHIP', 'SCHEDULE') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT UNSIGNED NULL, -- scholarship_id 또는 기타 관련 ID
    is_read BOOLEAN DEFAULT FALSE,
    action_route VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_nm (user_nm),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) CHARSET = utf8mb4;

-- 장학금 찜하기 테이블 생성
CREATE TABLE scholarship_bookmark (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_nm VARCHAR(20) NOT NULL,
    scholarship_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_scholarship (user_nm, scholarship_id),
    INDEX idx_user_nm (user_nm),
    INDEX idx_scholarship_id (scholarship_id),
    CONSTRAINT fk_bookmark_scholarship 
        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id) 
        ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;-