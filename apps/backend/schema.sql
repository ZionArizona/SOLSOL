-- =========================================================
--               SOLSOL 통합 데이터베이스 스키마
--    장학금 관리 시스템 완전 스키마 + 데이터
-- =========================================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE IF NOT EXISTS solsol DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE solsol;

-- =========================================================
--                    1. 기본 테이블 생성
-- =========================================================

-- university
CREATE TABLE university (
    univNm       BIGINT       NOT NULL PRIMARY KEY,
    univName     VARCHAR(255) NULL,
    mileageRatio DOUBLE       NULL
);

-- college
CREATE TABLE college (
    collegeNm BIGINT       NOT NULL,
    univNm    BIGINT       NOT NULL,
    name      VARCHAR(255) NULL,
    PRIMARY KEY (collegeNm, univNm)
);

-- department
CREATE TABLE department (
    deptNm    BIGINT       NOT NULL,
    collegeNm BIGINT       NOT NULL,
    univNm    BIGINT       NOT NULL,
    Deptname  VARCHAR(255) NULL,
    PRIMARY KEY (deptNm, collegeNm, univNm),
    CONSTRAINT FK_College_TO_Department_1
        FOREIGN KEY (collegeNm) REFERENCES college (collegeNm)
);

-- users
CREATE TABLE users (
    userNm      VARCHAR(20)                                                    NOT NULL PRIMARY KEY,
    userMileage INT                                                            NULL,
    accountNm   VARCHAR(100)                                                   NULL,
    userId      VARCHAR(100)                                                   NULL,
    password    VARCHAR(255)                                                   NULL,
    userKey     VARCHAR(100)                                                   NULL,
    userName    VARCHAR(100)                                                   NULL,
    state       ENUM ('ENROLLED', 'LEAVE_OF_ABSENCE', 'GRADUATED', 'EXPELLED') NULL,
    grade       INT                                                            NULL,
    gpa         DECIMAL(3, 2)                                                  NULL,
    createdAt   DATETIME                                                       NULL,
    updatedAt   DATETIME                                                       NULL,
    role        ENUM ('ADMIN', 'STUDENT', 'STAFF')                             NULL,
    deptNm      BIGINT                                                         NOT NULL,
    collegeNm   BIGINT                                                         NOT NULL,
    univNm      BIGINT                                                         NOT NULL
);

-- scholarship
CREATE TABLE scholarship (
    id                       BIGINT UNSIGNED AUTO_INCREMENT      NOT NULL PRIMARY KEY,
    scholarship_name         VARCHAR(255)                        NOT NULL,
    description              TEXT                                NULL,
    type                     ENUM ('ACADEMIC', 'FINANCIAL_AID', 'ACTIVITY', 'OTHER') NOT NULL,
    amount                   INT UNSIGNED                        NOT NULL,
    number_of_recipients     INT UNSIGNED                        NOT NULL,
    payment_method           ENUM ('LUMP_SUM', 'INSTALLMENT')    NOT NULL DEFAULT 'LUMP_SUM',
    recruitment_start_date   DATE                                NULL,
    recruitment_end_date     DATE                                NOT NULL,
    evaluation_start_date    DATE                                NOT NULL,
    interview_date           DATE                                NULL,
    result_announcement_date DATE                                NOT NULL,
    evaluation_method        ENUM ('DOCUMENT_REVIEW', 'DOCUMENT_INTERVIEW') NOT NULL DEFAULT 'DOCUMENT_REVIEW',
    recruitment_status       ENUM ('DRAFT', 'OPEN', 'CLOSED')    NOT NULL DEFAULT 'OPEN',
    eligibility_condition    VARCHAR(500)                        NOT NULL,
    grade_restriction        VARCHAR(100)                        NULL,
    major_restriction        VARCHAR(255)                        NULL,
    duplicate_allowed        TINYINT(1)                          NOT NULL DEFAULT 1,
    min_gpa                  DECIMAL(3, 2)                       NULL,
    category                 VARCHAR(100)                        NULL,
    contact_person_name      VARCHAR(100)                        NOT NULL,
    contact_phone            VARCHAR(50)                         NOT NULL,
    contact_email            VARCHAR(255)                        NOT NULL,
    office_location          VARCHAR(255)                        NULL,
    consultation_hours       VARCHAR(255)                        NULL,
    created_by               VARCHAR(100)                        NULL,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP  NOT NULL,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    required_documents       JSON                                NULL COMMENT '필수서류'
);
CREATE INDEX idx_scholarship_dates   ON scholarship (recruitment_start_date, recruitment_end_date);
CREATE INDEX idx_scholarship_status  ON scholarship (recruitment_status);
CREATE INDEX idx_type_category       ON scholarship (type, category);

-- scholarship_criteria
CREATE TABLE scholarship_criteria (
    id             BIGINT UNSIGNED AUTO_INCREMENT           NOT NULL PRIMARY KEY,
    scholarship_id BIGINT UNSIGNED                          NOT NULL,
    name           VARCHAR(255)                             NOT NULL,
    std_point      DECIMAL(6, 2)                            NULL,
    weight_percent TINYINT UNSIGNED                         NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP       NOT NULL,
    CONSTRAINT fk_criteria_scholarship
        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
            ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;
CREATE INDEX idx_criteria_scholarship ON scholarship_criteria (scholarship_id);

-- scholarship_notice
CREATE TABLE scholarship_notice (
    id             BIGINT UNSIGNED AUTO_INCREMENT           NOT NULL PRIMARY KEY,
    scholarship_id BIGINT UNSIGNED                          NOT NULL,
    title          VARCHAR(255)                             NOT NULL,
    content        TEXT                                     NOT NULL,
    image_url      VARCHAR(500)                             NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP       NOT NULL,
    CONSTRAINT fk_notice_scholarship
        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
            ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;
CREATE INDEX idx_notice_scholarship ON scholarship_notice (scholarship_id);

-- scholarship_tag
CREATE TABLE scholarship_tag (
    id             BIGINT UNSIGNED AUTO_INCREMENT           NOT NULL PRIMARY KEY,
    scholarship_id BIGINT UNSIGNED                          NOT NULL,
    tag            VARCHAR(50)                              NOT NULL,
    CONSTRAINT uniq_scholarship_tag UNIQUE (scholarship_id, tag),
    CONSTRAINT fk_tag_scholarship
        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
            ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;
CREATE INDEX idx_tag ON scholarship_tag (tag);

-- application
CREATE TABLE application (
    userNm        VARCHAR(20)                              NOT NULL,
    scholarshipNm BIGINT                                   NOT NULL,
    state         ENUM ('PENDING', 'APPROVED', 'REJECTED') NULL,
    applied_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP      NULL,
    reason        TEXT                                     NULL,
    PRIMARY KEY (userNm, scholarshipNm)
);

-- applicationdocument
CREATE TABLE applicationdocument (
    applicationDocumentNm BIGINT AUTO_INCREMENT            NOT NULL,
    userNm                VARCHAR(20)                           NOT NULL,
    scholarshipNm         BIGINT                           NOT NULL,
    object_key_enc        VARBINARY(512)                   NULL COMMENT '암호화된 S3 객체 키',
    file_name_enc         VARBINARY(512)                   NULL COMMENT '암호화된 파일명',
    content_type          VARCHAR(100)                     NULL,
    file_size             BIGINT                           NULL,
    checksum_sha256       VARCHAR(64)                      NULL COMMENT '파일 무결성 검증용 SHA-256 해시',
    uploaded_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    PRIMARY KEY (applicationDocumentNm, userNm, scholarshipNm)
);

-- document (기존 방식으로 유지)
CREATE TABLE document (
    DocumentNm    BIGINT       NOT NULL PRIMARY KEY,
    scholarshipNm BIGINT       NOT NULL,
    name          VARCHAR(255) NULL,
    description   TEXT         NULL
);

-- eligibility (기존 방식으로 유지)
CREATE TABLE eligibility (
    eligibilityNm BIGINT                            NOT NULL PRIMARY KEY,
    scholarshipNm BIGINT                            NOT NULL,
    field         ENUM ('GPA', 'GRADE', 'STATE')    NULL,
    operator      ENUM ('>=', '<=', '==', '>', '<') NULL,
    value         VARCHAR(255)                      NULL,
    content       TEXT                              NULL
);

-- mileage (업데이트 반영)
CREATE TABLE mileage (
    `Key`         BIGINT AUTO_INCREMENT NOT NULL,
    userNm        VARCHAR(20)                NOT NULL,
    amount        INT                   NULL,
    scholarshipNm BIGINT                NULL COMMENT '장학금 식별자',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '마일리지 지급 시간',
    reason        VARCHAR(255) DEFAULT '장학금 마일리지 지급' COMMENT '마일리지 지급 사유',
    PRIMARY KEY (`Key`, userNm),
    CONSTRAINT unique_user_scholarship_mileage 
        UNIQUE (userNm, scholarshipNm)
);

-- exchange
CREATE TABLE exchange (
    exchangeNm   BIGINT                                   NOT NULL,
    userNm       VARCHAR(20)                                   NOT NULL,
    amount       INT                                      NULL,
    state        ENUM ('PENDING', 'APPROVED', 'REJECTED') NULL,
    applied_at   TIMESTAMP                                NULL,
    processed_at TIMESTAMP                                NULL,
    PRIMARY KEY (exchangeNm, userNm)
);

-- mybox
CREATE TABLE mybox (
    id              BIGINT AUTO_INCREMENT                  NOT NULL PRIMARY KEY,
    userNm          VARCHAR(20)                            NOT NULL,
    object_key_enc  VARBINARY(512)                         NULL,
    file_name_enc   VARBINARY(512)                         NULL,
    content_type    VARCHAR(100)                           NULL,
    size_bytes      BIGINT                                 NULL,
    checksum_sha256 CHAR(64)                               NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP     NOT NULL,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL
);

-- mybox_audit
CREATE TABLE mybox_audit (
    id              BIGINT AUTO_INCREMENT                  NOT NULL PRIMARY KEY,
    mybox_id        BIGINT                                 NOT NULL,
    actor_userNm    VARCHAR(20)                            NULL,
    action          ENUM ('CREATE', 'DOWNLOAD_URL_ISSUED', 'DELETE') NULL,
    object_key_enc  VARBINARY(512)                         NULL,
    file_name_enc   VARBINARY(512)                         NULL,
    size_bytes      BIGINT                                 NULL,
    checksum_sha256 CHAR(64)                               NULL,
    s3_etag         VARCHAR(80)                            NULL,
    s3_version_id   VARCHAR(200)                           NULL,
    actor_ip        VARCHAR(64)                            NULL,
    user_agent      VARCHAR(255)                           NULL,
    detail          JSON                                   NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP     NOT NULL
);

-- personalschedule
CREATE TABLE personalschedule (
    id             BIGINT UNSIGNED AUTO_INCREMENT            NOT NULL PRIMARY KEY,
    student_no     VARCHAR(20)                               NOT NULL,
    schedule_date  DATE                                      NOT NULL,
    schedule_name  VARCHAR(100)                              NOT NULL,
    start_time     TIME                                      NOT NULL,
    end_time       TIME                                      NOT NULL,
    notify_minutes TINYINT UNSIGNED DEFAULT '0'              NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP        NOT NULL,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    CONSTRAINT fk_personalschedule_user
        FOREIGN KEY (student_no) REFERENCES users (userNm)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CHECK (`end_time` > `start_time`)
);
CREATE INDEX idx_personalschedule_user_date ON personalschedule (student_no, schedule_date);

-- refresh_token
CREATE TABLE refresh_token (
    userNm      VARCHAR(20)   NOT NULL,
    userId      VARCHAR(100)  NOT NULL,
    token       VARCHAR(255)  NOT NULL PRIMARY KEY,
    issuedAt    DATETIME      NOT NULL,
    expiresAt   DATETIME      NOT NULL,
    revoked     TINYINT(1)    DEFAULT 0 NULL,
    userAgent   VARCHAR(255)  NULL,
    ip          VARCHAR(45)   NULL,
    rotatedFrom VARCHAR(255)  NULL,
    lastUsedAt  DATETIME      NULL
);
CREATE INDEX idx_expiresAt ON refresh_token (expiresAt);
CREATE INDEX idx_revoked   ON refresh_token (revoked);
CREATE INDEX idx_userId    ON refresh_token (userId);
CREATE INDEX idx_userNm    ON refresh_token (userNm);

-- notification
CREATE TABLE notification (
    id            BIGINT UNSIGNED AUTO_INCREMENT            NOT NULL PRIMARY KEY,
    user_nm       VARCHAR(20)                               NOT NULL,
    type          ENUM('SCHOLARSHIP_RESULT', 'DEADLINE_REMINDER', 'NEW_SCHOLARSHIP', 'SCHOLARSHIP', 'SCHEDULE') NOT NULL,
    title         VARCHAR(255)                              NOT NULL,
    message       TEXT                                      NOT NULL,
    related_id    BIGINT UNSIGNED                           NULL,
    is_read       BOOLEAN                                   NULL DEFAULT FALSE,
    action_route  VARCHAR(255)                              NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP        NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    INDEX idx_user_nm (user_nm),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) CHARSET = utf8mb4;

-- scholarship_bookmark
CREATE TABLE scholarship_bookmark (
    id             BIGINT UNSIGNED AUTO_INCREMENT           NOT NULL PRIMARY KEY,
    user_nm        VARCHAR(20)                              NOT NULL,
    scholarship_id BIGINT UNSIGNED                          NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP       NOT NULL,
    UNIQUE KEY unique_user_scholarship (user_nm, scholarship_id),
    INDEX idx_user_nm (user_nm),
    INDEX idx_scholarship_id (scholarship_id),
    CONSTRAINT fk_bookmark_scholarship
        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
            ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;

-- =========================================================
--                    2. 기본 데이터 삽입
-- =========================================================

-- 대학교 데이터 (115개 대학)
INSERT INTO `university` (`univNm`, `univName`, `mileageRatio`) VALUES
(1, 'ICT폴리텍대학', 0.7),
(2, '강동대학교', 0.7),
(3, '강서대학교', 0.7),
(4, '강원도립대학교', 0.7),
(5, '경기과학기술대학교', 0.7),
(6, '경기대학교', 0.75),
(7, '경남정보대학교', 0.7),
(8, '경안대학원대학교', 0.7),
(9, '광주대학교', 0.7),
(10, '광주보건대학교', 0.7),
(11, '국립목포대학교', 0.8),
(12, '국제뇌교육대학원대학교', 0.7),
(13, '김천대학교', 0.7),
(14, '남서울대학교', 0.7),
(15, '대경대학교', 0.7),
(16, '대구공업대학교', 0.7),
(17, '대구보건대학교', 0.7),
(18, '대전총신평생교육원', 0.7),
(19, '대진대학교', 0.7),
(20, '대한신학대학원대', 0.7),
(21, '동국대학교', 0.8),
(22, '동국대학교WISE', 0.8),
(23, '동덕여자대학교', 0.75),
(24, '동서대학교', 0.7),
(25, '동아방송예술대학교', 0.7),
(26, '동아보건대학교', 0.7),
(27, '동양대학교', 0.7),
(28, '동원과학기술대학교', 0.7),
(29, '동의대학교', 0.75),
(30, '두원공과대학교', 0.7),
(31, '목원대학교', 0.7),
(32, '목포과학대학교', 0.7),
(33, '목포해양대학교', 0.75),
(34, '문경대학교', 0.7),
(35, '배재대학교', 0.7),
(36, '백석대학교', 0.7),
(37, '백석문화대학교', 0.7),
(38, '상명대학교', 0.75),
(39, '상지대학교', 0.7),
(40, '서울사회복지대학원대', 0.7),
(41, '서울성경신학대학원대', 0.7),
(42, '서울신학대학교', 0.7),
(43, '서울여자간호대학교', 0.7),
(44, '서울예술대학교', 0.75),
(45, '서원대학교', 0.7),
(46, '서정대학교', 0.7),
(47, '성서침례대학원대', 0.7),
(48, '송곡대학교', 0.7),
(49, '수도국제대학원대', 0.7),
(50, '수성대학교', 0.7),
(51, '수원과학대학교', 0.7),
(52, '수원대학교', 0.7),
(53, '수원여자대학교', 0.7),
(54, '숙명여자대학교', 0.85),
(55, '신성대학교', 0.7),
(56, '신안산대학교', 0.7),
(57, '아세아항공직업전문학교', 0.7),
(58, '안산대학교', 0.7),
(59, '안양대학교', 0.7),
(60, '에스라성경대학원대', 0.7),
(61, '엣지대학교', 0.7),
(62, '영진전문대학교', 0.7),
(63, '용인대학교', 0.7),
(64, '용인예술과학대학교', 0.7),
(65, '울산과학대학교', 0.7),
(66, '웅지세무대', 0.7),
(67, '원광보건대학교', 0.7),
(68, '위덕대학교', 0.7),
(69, '유원대학교', 0.7),
(70, '유한대학교', 0.7),
(71, '을지대학교', 0.75),
(72, '이화여자대학교', 0.85),
(73, '인덕대학교', 0.7),
(74, '인제대학교', 0.75),
(75, '인천가톨릭대학교', 0.75),
(76, '재능대학교', 0.7),
(77, '전북과학대학교', 0.7),
(78, '전주기전대학', 0.7),
(79, '제네바신학대학원대', 0.7),
(80, '주안대학원대', 0.7),
(81, '중원대학교', 0.7),
(82, '창신대학교', 0.7),
(83, '천안총신평생교육원', 0.7),
(84, '청강문화산업대학교', 0.7),
(85, '청암대학교', 0.7),
(86, '청주대학교', 0.7),
(87, '초당대학교', 0.7),
(88, '총신대학교', 0.7),
(89, '추계예술대학교', 0.75),
(90, '춘해보건대학교', 0.7),
(91, '충북보건과학대학교', 0.7),
(92, '충청대학교', 0.7),
(93, '칼빈대학교', 0.7),
(94, '평택대학교', 0.7),
(95, '포항대학교', 0.7),
(96, '한국관광대학교', 0.7),
(97, '한국성서대학교', 0.7),
(98, '한국전통문화대학교', 0.75),
(99, '한국침례신학대학교', 0.7),
(100, '한국호텔관광실용전문학교', 0.7),
(101, '한남대학교', 0.75),
(102, '한서대학교', 0.7),
(103, '한성대학교', 0.75),
(104, '한성콘텐츠디자인칼리지', 0.7),
(105, '한세대학교', 0.7),
(106, '한신대학교', 0.7),
(107, '한양대학교', 0.85),
(108, '한양여자대학교', 0.7),
(109, '한영대학교', 0.7),
(110, '합동신학대학원대', 0.7),
(111, '헤이영대학교', 0.7),
(112, '협성대학교', 0.7),
(113, '홍익대학교', 0.8),
(114, '화성의과대학교', 0.7),
(115, '횃불트리니티신학대학원대', 0.7),
(999, '미지정대학교', 0.5)
ON DUPLICATE KEY UPDATE 
    `univName` = VALUES(`univName`),
    `mileageRatio` = VALUES(`mileageRatio`);

-- 각 대학교에 대한 기본 College 추가 (일반학부) - 첫 20개만 표시
INSERT INTO `college` (`collegeNm`, `univNm`, `name`) VALUES
(1, 1, '일반학부'), (1, 2, '일반학부'), (1, 3, '일반학부'), (1, 4, '일반학부'), (1, 5, '일반학부'),
(1, 6, '일반학부'), (1, 7, '일반학부'), (1, 8, '일반학부'), (1, 9, '일반학부'), (1, 10, '일반학부'),
(1, 11, '일반학부'), (1, 12, '일반학부'), (1, 13, '일반학부'), (1, 14, '일반학부'), (1, 15, '일반학부'),
(1, 16, '일반학부'), (1, 17, '일반학부'), (1, 18, '일반학부'), (1, 19, '일반학부'), (1, 20, '일반학부'),
(1, 21, '일반학부'), (1, 22, '일반학부'), (1, 23, '일반학부'), (1, 24, '일반학부'), (1, 25, '일반학부'),
(1, 26, '일반학부'), (1, 27, '일반학부'), (1, 28, '일반학부'), (1, 29, '일반학부'), (1, 30, '일반학부'),
(1, 31, '일반학부'), (1, 32, '일반학부'), (1, 33, '일반학부'), (1, 34, '일반학부'), (1, 35, '일반학부'),
(1, 36, '일반학부'), (1, 37, '일반학부'), (1, 38, '일반학부'), (1, 39, '일반학부'), (1, 40, '일반학부'),
(1, 41, '일반학부'), (1, 42, '일반학부'), (1, 43, '일반학부'), (1, 44, '일반학부'), (1, 45, '일반학부'),
(1, 46, '일반학부'), (1, 47, '일반학부'), (1, 48, '일반학부'), (1, 49, '일반학부'), (1, 50, '일반학부'),
(1, 51, '일반학부'), (1, 52, '일반학부'), (1, 53, '일반학부'), (1, 54, '일반학부'), (1, 55, '일반학부'),
(1, 56, '일반학부'), (1, 57, '일반학부'), (1, 58, '일반학부'), (1, 59, '일반학부'), (1, 60, '일반학부'),
(1, 61, '일반학부'), (1, 62, '일반학부'), (1, 63, '일반학부'), (1, 64, '일반학부'), (1, 65, '일반학부'),
(1, 66, '일반학부'), (1, 67, '일반학부'), (1, 68, '일반학부'), (1, 69, '일반학부'), (1, 70, '일반학부'),
(1, 71, '일반학부'), (1, 72, '일반학부'), (1, 73, '일반학부'), (1, 74, '일반학부'), (1, 75, '일반학부'),
(1, 76, '일반학부'), (1, 77, '일반학부'), (1, 78, '일반학부'), (1, 79, '일반학부'), (1, 80, '일반학부'),
(1, 81, '일반학부'), (1, 82, '일반학부'), (1, 83, '일반학부'), (1, 84, '일반학부'), (1, 85, '일반학부'),
(1, 86, '일반학부'), (1, 87, '일반학부'), (1, 88, '일반학부'), (1, 89, '일반학부'), (1, 90, '일반학부'),
(1, 91, '일반학부'), (1, 92, '일반학부'), (1, 93, '일반학부'), (1, 94, '일반학부'), (1, 95, '일반학부'),
(1, 96, '일반학부'), (1, 97, '일반학부'), (1, 98, '일반학부'), (1, 99, '일반학부'), (1, 100, '일반학부'),
(1, 101, '일반학부'), (1, 102, '일반학부'), (1, 103, '일반학부'), (1, 104, '일반학부'), (1, 105, '일반학부'),
(1, 106, '일반학부'), (1, 107, '일반학부'), (1, 108, '일반학부'), (1, 109, '일반학부'), (1, 110, '일반학부'),
(1, 111, '일반학부'), (1, 112, '일반학부'), (1, 113, '일반학부'), (1, 114, '일반학부'), (1, 115, '일반학부'),
(999, 999, '미지정단과대')
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`);

-- 각 대학교에 대한 기본 department 추가 (일반학과)
INSERT INTO `department` (`deptNm`, `collegeNm`, `univNm`, `Deptname`) VALUES
(1, 1, 1, '일반학과'), (1, 1, 2, '일반학과'), (1, 1, 3, '일반학과'), (1, 1, 4, '일반학과'), (1, 1, 5, '일반학과'),
(1, 1, 6, '일반학과'), (1, 1, 7, '일반학과'), (1, 1, 8, '일반학과'), (1, 1, 9, '일반학과'), (1, 1, 10, '일반학과'),
(1, 1, 11, '일반학과'), (1, 1, 12, '일반학과'), (1, 1, 13, '일반학과'), (1, 1, 14, '일반학과'), (1, 1, 15, '일반학과'),
(1, 1, 16, '일반학과'), (1, 1, 17, '일반학과'), (1, 1, 18, '일반학과'), (1, 1, 19, '일반학과'), (1, 1, 20, '일반학과'),
(1, 1, 21, '일반학과'), (1, 1, 22, '일반학과'), (1, 1, 23, '일반학과'), (1, 1, 24, '일반학과'), (1, 1, 25, '일반학과'),
(1, 1, 26, '일반학과'), (1, 1, 27, '일반학과'), (1, 1, 28, '일반학과'), (1, 1, 29, '일반학과'), (1, 1, 30, '일반학과'),
(1, 1, 31, '일반학과'), (1, 1, 32, '일반학과'), (1, 1, 33, '일반학과'), (1, 1, 34, '일반학과'), (1, 1, 35, '일반학과'),
(1, 1, 36, '일반학과'), (1, 1, 37, '일반학과'), (1, 1, 38, '일반학과'), (1, 1, 39, '일반학과'), (1, 1, 40, '일반학과'),
(1, 1, 41, '일반학과'), (1, 1, 42, '일반학과'), (1, 1, 43, '일반학과'), (1, 1, 44, '일반학과'), (1, 1, 45, '일반학과'),
(1, 1, 46, '일반학과'), (1, 1, 47, '일반학과'), (1, 1, 48, '일반학과'), (1, 1, 49, '일반학과'), (1, 1, 50, '일반학과'),
(1, 1, 51, '일반학과'), (1, 1, 52, '일반학과'), (1, 1, 53, '일반학과'), (1, 1, 54, '일반학과'), (1, 1, 55, '일반학과'),
(1, 1, 56, '일반학과'), (1, 1, 57, '일반학과'), (1, 1, 58, '일반학과'), (1, 1, 59, '일반학과'), (1, 1, 60, '일반학과'),
(1, 1, 61, '일반학과'), (1, 1, 62, '일반학과'), (1, 1, 63, '일반학과'), (1, 1, 64, '일반학과'), (1, 1, 65, '일반학과'),
(1, 1, 66, '일반학과'), (1, 1, 67, '일반학과'), (1, 1, 68, '일반학과'), (1, 1, 69, '일반학과'), (1, 1, 70, '일반학과'),
(1, 1, 71, '일반학과'), (1, 1, 72, '일반학과'), (1, 1, 73, '일반학과'), (1, 1, 74, '일반학과'), (1, 1, 75, '일반학과'),
(1, 1, 76, '일반학과'), (1, 1, 77, '일반학과'), (1, 1, 78, '일반학과'), (1, 1, 79, '일반학과'), (1, 1, 80, '일반학과'),
(1, 1, 81, '일반학과'), (1, 1, 82, '일반학과'), (1, 1, 83, '일반학과'), (1, 1, 84, '일반학과'), (1, 1, 85, '일반학과'),
(1, 1, 86, '일반학과'), (1, 1, 87, '일반학과'), (1, 1, 88, '일반학과'), (1, 1, 89, '일반학과'), (1, 1, 90, '일반학과'),
(1, 1, 91, '일반학과'), (1, 1, 92, '일반학과'), (1, 1, 93, '일반학과'), (1, 1, 94, '일반학과'), (1, 1, 95, '일반학과'),
(1, 1, 96, '일반학과'), (1, 1, 97, '일반학과'), (1, 1, 98, '일반학과'), (1, 1, 99, '일반학과'), (1, 1, 100, '일반학과'),
(1, 1, 101, '일반학과'), (1, 1, 102, '일반학과'), (1, 1, 103, '일반학과'), (1, 1, 104, '일반학과'), (1, 1, 105, '일반학과'),
(1, 1, 106, '일반학과'), (1, 1, 107, '일반학과'), (1, 1, 108, '일반학과'), (1, 1, 109, '일반학과'), (1, 1, 110, '일반학과'),
(1, 1, 111, '일반학과'), (1, 1, 112, '일반학과'), (1, 1, 113, '일반학과'), (1, 1, 114, '일반학과'), (1, 1, 115, '일반학과'),
(999, 999, 999, '미지정학과')
ON DUPLICATE KEY UPDATE 
    `Deptname` = VALUES(`Deptname`);

-- =========================================================
--                    3. 샘플 장학금 데이터
-- =========================================================

-- 성적우수 장학금 2025-1 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '성적우수 장학금 2025-1',
    '직전학기 성적 우수자를 위한 장학금',
    'ACADEMIC',
    2000000, 20, 'LUMP_SUM',
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() + INTERVAL 12 DAY,
    CURDATE() + INTERVAL 15 DAY,
    CURDATE() + INTERVAL 25 DAY,
    CURDATE() + INTERVAL 35 DAY,
    'DOCUMENT_INTERVIEW',
    'OPEN',
    '직전 학기 평점 3.8 이상',
    '1,2,3,4',
    '전체',
    1,
    3.80,
    '성적우수',
    '학생지원팀 홍길동', '02-1234-5678', 'aid@univ.ac.kr',
    '학생회관 2층', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','성적증명서','keywords',JSON_ARRAY('성적','GPA'),'required',TRUE),
    JSON_OBJECT('name','재학증명서','keywords',JSON_ARRAY('재학','학생'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='성적우수 장학금 2025-1');

-- 생활지원 장학금 2025 상반기 (CLOSED)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '생활지원 장학금 2025 상반기',
    '경제적 사정이 어려운 학생을 위한 생활비 지원',
    'FINANCIAL_AID',
    1500000, 50, 'INSTALLMENT',
    CURDATE() - INTERVAL 40 DAY,
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() - INTERVAL 3 DAY,
    NULL,
    CURDATE() + INTERVAL 3 DAY,
    'DOCUMENT_REVIEW',
    'CLOSED',
    '기초생활수급/차상위 우선',
    '전체',
    '전체',
    1,
    NULL,
    '생활지원',
    '학생복지과 김민수', '02-2222-3333', 'welfare@univ.ac.kr',
    '본관 1층', '평일 10:00~16:00',
    JSON_ARRAY(
    JSON_OBJECT('name','소득증빙서류','keywords',JSON_ARRAY('기초생활','차상위'),'required',TRUE),
    JSON_OBJECT('name','통장사본','keywords',JSON_ARRAY('계좌'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='생활지원 장학금 2025 상반기');

-- 공로/활동 장학금 2025 특별 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '공로/활동 장학금 2025 특별',
    '동아리/학생회 등 교내외 공로 및 활동 실적 우수자 지원',
    'ACTIVITY',
    1000000, 30, 'LUMP_SUM',
    CURDATE() - INTERVAL 2 DAY,
    CURDATE() + INTERVAL 20 DAY,
    CURDATE() + INTERVAL 21 DAY,
    NULL,
    CURDATE() + INTERVAL 30 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '활동 증빙 필수',
    '전체',
    '전체',
    1,
    NULL,
    '공로/활동',
    '학생지원처 이지은', '02-7777-8888', 'activity@univ.ac.kr',
    '학생회관 3층', '평일 09:30~17:30',
    JSON_ARRAY(
    JSON_OBJECT('name','활동증빙자료','keywords',JSON_ARRAY('수상','동아리','학생회'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='공로/활동 장학금 2025 특별');

-- =========================================================
--                    4. 완료 메시지
-- =========================================================

-- 스키마 생성 완료
SELECT 'SOLSOL 데이터베이스 스키마 생성이 완료되었습니다!' AS status;
SELECT CONCAT('총 ', COUNT(*), '개의 대학이 등록되었습니다.') AS university_count FROM university;
SELECT CONCAT('총 ', COUNT(*), '개의 장학금이 등록되었습니다.') AS scholarship_count FROM scholarship;