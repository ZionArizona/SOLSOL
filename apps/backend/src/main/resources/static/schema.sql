-- =========================
-- 1) USERS (기본 사용자)
-- =========================
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
                       role        ENUM ('ADMIN', 'STUDENT', 'STAFF')                             NOT NULL,
                       deptNm      BIGINT                                                         NOT NULL,
                       collegeNm   BIGINT                                                         NOT NULL,
                       univNm      BIGINT                                                         NOT NULL
);

-- =========================
-- 2) UNIVERSITY / COLLEGE / DEPARTMENT
-- =========================
CREATE TABLE university (
                            univNm       BIGINT       NOT NULL PRIMARY KEY,
                            univName     VARCHAR(255) NULL,
                            mileageRatio DOUBLE       NULL
);

CREATE TABLE college (
                         collegeNm BIGINT       NOT NULL,
                         univNm    BIGINT       NOT NULL,
                         name      VARCHAR(255) NULL,
                         PRIMARY KEY (collegeNm, univNm)
);

CREATE TABLE department (
                            deptNm    BIGINT       NOT NULL,
                            collegeNm BIGINT       NOT NULL,
                            univNm    BIGINT       NOT NULL,
                            Deptname  VARCHAR(255) NULL,
                            PRIMARY KEY (deptNm, collegeNm, univNm),
                            CONSTRAINT FK_College_TO_Department_1
                                FOREIGN KEY (collegeNm) REFERENCES college (collegeNm)
);

-- =========================
-- 3) SCHOLARSHIP & 관련 테이블
-- =========================
CREATE TABLE scholarship (
                             id                       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                             scholarship_name         VARCHAR(255)                                                             NOT NULL,
                             description              TEXT                                                                     NULL,
                             type                     ENUM ('ACADEMIC', 'FINANCIAL_AID', 'ACTIVITY', 'OTHER')                  NOT NULL,
                             amount                   INT UNSIGNED                                                             NOT NULL,
                             number_of_recipients     INT UNSIGNED                                                             NOT NULL,
                             payment_method           ENUM ('LUMP_SUM', 'INSTALLMENT')               DEFAULT 'LUMP_SUM'        NOT NULL,
                             recruitment_start_date   DATE                                                                     NULL,
                             recruitment_end_date     DATE                                                                     NOT NULL,
                             evaluation_start_date    DATE                                                                     NOT NULL,
                             interview_date           DATE                                                                     NULL,
                             result_announcement_date DATE                                                                     NOT NULL,
                             evaluation_method        ENUM ('DOCUMENT_REVIEW', 'DOCUMENT_INTERVIEW') DEFAULT 'DOCUMENT_REVIEW' NOT NULL,
                             recruitment_status       ENUM ('DRAFT', 'OPEN', 'CLOSED')               DEFAULT 'OPEN'            NOT NULL,
                             eligibility_condition    VARCHAR(500)                                                             NOT NULL,
                             grade_restriction        VARCHAR(100)                                                             NULL,
                             major_restriction        VARCHAR(255)                                                             NULL,
                             duplicate_allowed        TINYINT(1)                                     DEFAULT 1                 NOT NULL,
                             min_gpa                  DECIMAL(3, 2)                                                            NULL,
                             category                 VARCHAR(100)                                                             NULL,
                             contact_person_name      VARCHAR(100)                                                             NOT NULL,
                             contact_phone            VARCHAR(50)                                                              NOT NULL,
                             contact_email            VARCHAR(255)                                                             NOT NULL,
                             office_location          VARCHAR(255)                                                             NULL,
                             consultation_hours       VARCHAR(255)                                                             NULL,
                             created_by               VARCHAR(100)                                                             NULL,
                             created_at               DATETIME                                       DEFAULT CURRENT_TIMESTAMP NOT NULL,
                             updated_at               DATETIME                                       DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                             required_documents       JSON                                                                     NULL COMMENT '필수'
);

CREATE INDEX idx_scholarship_dates   ON scholarship (recruitment_start_date, recruitment_end_date);
CREATE INDEX idx_scholarship_status  ON scholarship (recruitment_status);
CREATE INDEX idx_type_category       ON scholarship (type, category);

CREATE TABLE scholarship_criteria (
                                      id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                      scholarship_id BIGINT UNSIGNED                    NOT NULL,
                                      name           VARCHAR(255)                       NOT NULL,
                                      std_point      DECIMAL(6, 2)                      NULL,
                                      weight_percent TINYINT UNSIGNED                   NOT NULL,
                                      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                      CONSTRAINT fk_criteria_scholarship
                                          FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
                                              ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;

CREATE INDEX idx_criteria_scholarship ON scholarship_criteria (scholarship_id);

CREATE TABLE scholarship_notice (
                                    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                    scholarship_id BIGINT UNSIGNED                    NOT NULL,
                                    title          VARCHAR(255)                       NOT NULL,
                                    content        TEXT                               NOT NULL,
                                    image_url      VARCHAR(500)                       NULL,
                                    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                    CONSTRAINT fk_notice_scholarship
                                        FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
                                            ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;

CREATE INDEX idx_notice_scholarship ON scholarship_notice (scholarship_id);

CREATE TABLE scholarship_tag (
                                 id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                 scholarship_id BIGINT UNSIGNED NOT NULL,
                                 tag            VARCHAR(50)     NOT NULL,
                                 CONSTRAINT uniq_scholarship_tag UNIQUE (scholarship_id, tag),
                                 CONSTRAINT fk_tag_scholarship
                                     FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
                                         ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;

CREATE INDEX idx_tag ON scholarship_tag (tag);

CREATE TABLE scholarship_bookmark (
                                      id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                      user_nm        VARCHAR(20)                        NOT NULL,
                                      scholarship_id BIGINT UNSIGNED                    NOT NULL,
                                      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
                                      CONSTRAINT unique_user_scholarship UNIQUE (user_nm, scholarship_id),
                                      CONSTRAINT fk_bookmark_scholarship
                                          FOREIGN KEY (scholarship_id) REFERENCES scholarship (id)
                                              ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET = utf8mb4;

CREATE INDEX idx_user_nm        ON scholarship_bookmark (user_nm);
CREATE INDEX idx_scholarship_id ON scholarship_bookmark (scholarship_id);

-- =========================
-- 4) APPLICATION (신청)
-- =========================
CREATE TABLE application (
                             userNm        VARCHAR(20)                                   NOT NULL,
                             scholarshipNm BIGINT                                   NOT NULL,
                             state         ENUM ('PENDING', 'APPROVED', 'REJECTED') NULL,
                             applied_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP      NULL,
                             reason        TEXT                                     NULL,
                             PRIMARY KEY (userNm, scholarshipNm)
);

-- =========================
-- 5) APPLICATIONDOCUMENT (ALTER 반영본)
--     - file_url / original_file_name 제거
--     - object_key_enc / file_name_enc / checksum_sha256 추가
--     - PK: 단일 INT AUTO_INCREMENT
--     - 보조 인덱스 및 FK(application) 추가
-- =========================
CREATE TABLE applicationdocument (
                                     applicationDocumentNm BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     userNm                BIGINT                              NOT NULL,
                                     scholarshipNm         BIGINT                              NOT NULL,
                                     uploaded_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                                     file_size             BIGINT                              NULL,
                                     content_type          VARCHAR(100)                        NULL,
                                     object_key_enc        BLOB                                NULL,
                                     file_name_enc         BLOB                                NULL,
                                     checksum_sha256       VARCHAR(64)                         NULL,
                                     CONSTRAINT fk_appdoc_application
                                         FOREIGN KEY (userNm, scholarshipNm)
                                             REFERENCES application (userNm, scholarshipNm)
                                             ON UPDATE CASCADE
                                             ON DELETE CASCADE
);

CREATE INDEX idx_ad_app ON applicationdocument (userNm, scholarshipNm);

-- =========================
-- 6) 기타 테이블
-- =========================
CREATE TABLE document (
                          DocumentNm    BIGINT       NOT NULL PRIMARY KEY,
                          scholarshipNm BIGINT       NOT NULL,
                          name          VARCHAR(255) NULL,
                          description   TEXT         NULL
);

CREATE TABLE eligibility (
                             eligibilityNm BIGINT                            NOT NULL PRIMARY KEY,
                             scholarshipNm BIGINT                            NOT NULL,
                             field         ENUM ('GPA', 'GRADE', 'STATE')    NULL,
                             operator      ENUM ('>=', '<=', '==', '>', '<') NULL,
                             value         VARCHAR(255)                      NULL,
                             content       TEXT                              NULL
);

CREATE TABLE exchange (
                          exchangeNm   BIGINT                                   NOT NULL,
                          userNm       VARCHAR(20)                                   NOT NULL,
                          amount       INT                                      NULL,
                          state        ENUM ('PENDING', 'APPROVED', 'REJECTED') NULL,
                          applied_at   TIMESTAMP                                NULL,
                          processed_at TIMESTAMP                                NULL,
                          PRIMARY KEY (exchangeNm, userNm)
);

-- mileage: ALTER 반영 (scholarshipNm/created_at/reason & unique(userNm,scholarshipNm))
CREATE TABLE mileage (
                         `Key`          BIGINT AUTO_INCREMENT,
                         userNm         VARCHAR(20)                                 NOT NULL,
                         amount         INT                                    NULL,
                         scholarshipNm  BIGINT                                 NULL COMMENT '장학금 식별자',
                         created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP    COMMENT '마일리지 지급 시간',
                         reason         VARCHAR(255) DEFAULT '장학금 마일리지 지급' COMMENT '마일리지 지급 사유',
                         PRIMARY KEY (`Key`, userNm),
                         CONSTRAINT unique_user_scholarship_mileage UNIQUE (userNm, scholarshipNm)
);

CREATE TABLE mybox (
                       id              BIGINT AUTO_INCREMENT PRIMARY KEY,
                       userNm          VARCHAR(20)                        NOT NULL,
                       object_key_enc  VARBINARY(512)                     NULL,
                       file_name_enc   VARBINARY(512)                     NULL,
                       content_type    VARCHAR(100)                       NULL,
                       size_bytes      BIGINT                             NULL,
                       checksum_sha256 CHAR(64)                           NULL,
                       created_at      DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
                       updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE mybox_audit (
                             id              BIGINT AUTO_INCREMENT PRIMARY KEY,
                             mybox_id        BIGINT                                           NOT NULL,
                             actor_userNm    VARCHAR(20)                                      NULL,
                             action          ENUM ('CREATE', 'DOWNLOAD_URL_ISSUED', 'DELETE') NULL,
                             object_key_enc  VARBINARY(512)                                   NULL,
                             file_name_enc   VARBINARY(512)                                   NULL,
                             size_bytes      BIGINT                                           NULL,
                             checksum_sha256 CHAR(64)                                         NULL,
                             s3_etag         VARCHAR(80)                                      NULL,
                             s3_version_id   VARCHAR(200)                                     NULL,
                             actor_ip        VARCHAR(64)                                      NULL,
                             user_agent      VARCHAR(255)                                     NULL,
                             detail          JSON                                             NULL,
                             created_at      DATETIME DEFAULT CURRENT_TIMESTAMP               NULL
);

CREATE TABLE notification (
                              id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                              user_nm      VARCHAR(20)                                                                     NOT NULL,
                              type         ENUM('SCHOLARSHIP_RESULT', 'DEADLINE_REMINDER', 'NEW_SCHOLARSHIP', 'SCHEDULE')  NOT NULL,
                              title        VARCHAR(255)                                                                    NOT NULL,
                              message      TEXT                                                                            NOT NULL,
                              related_id   BIGINT UNSIGNED                                                                 NULL,
                              is_read      TINYINT(1) DEFAULT 0                                                            NULL,
                              action_route VARCHAR(255)                                                                    NULL,
                              created_at   DATETIME DEFAULT CURRENT_TIMESTAMP                                              NULL,
                              updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP                                              NULL ON UPDATE CURRENT_TIMESTAMP
) CHARSET = utf8mb4;

CREATE INDEX idx_user_nm    ON notification (user_nm);
CREATE INDEX idx_type       ON notification (type);
CREATE INDEX idx_is_read    ON notification (is_read);
CREATE INDEX idx_created_at ON notification (created_at);

CREATE TABLE personalschedule (
                                  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                  student_no     VARCHAR(20)                                NOT NULL,
                                  schedule_date  DATE                                       NOT NULL,
                                  schedule_name  VARCHAR(100)                               NOT NULL,
                                  start_time     TIME                                       NOT NULL,
                                  end_time       TIME                                       NOT NULL,
                                  notify_minutes TINYINT UNSIGNED DEFAULT '0'               NOT NULL,
                                  created_at     DATETIME         DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                  updated_at     DATETIME         DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_personalschedule_user
                                      FOREIGN KEY (student_no) REFERENCES users (userNm)
                                          ON UPDATE CASCADE ON DELETE CASCADE,
                                  CHECK (`end_time` > `start_time`)
);

CREATE INDEX idx_personalschedule_user_date ON personalschedule (student_no, schedule_date);

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
