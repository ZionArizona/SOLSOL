
CREATE TABLE `Mybox_audit` (
                               `id`    BIGINT AUTO_INCREMENT    PRIMARY KEY,
                               `mybox_id`    BIGINT    NOT NULL,
                               `actor_userNm`    VARCHAR(20)    NULL,
                               `action`    ENUM('CREATE','DOWNLOAD_URL_ISSUED','DELETE')    NULL,
                               `object_key_enc`    VARBINARY(512)    NULL,
                               `file_name_enc`    VARBINARY(512)    NULL,
                               `size_bytes`    BIGINT    NULL,
                               `checksum_sha256`    CHAR(64)    NULL,
                               `s3_etag`    VARCHAR(80)    NULL,
                               `s3_version_id`    VARCHAR(200)    NULL,
                               `actor_ip`    VARCHAR(64)    NULL,
                               `user_agent`    VARCHAR(255)    NULL,
                               `detail`    JSON    NULL,
                               `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Department` (
                              `deptNm`    BIGINT    NOT NULL,
                              `collegeNm`    BIGINT    NOT NULL,
                              `univNm`    BIGINT    NOT NULL,
                              `Deptname`    VARCHAR(255)    NULL
);

CREATE TABLE `University` (
                              `univNm`    BIGINT    NOT NULL,
                              `univName`    VARCHAR(255)    NULL,
                              `mileageRatio`    double    NULL
);

CREATE TABLE `Mileage` (
                           `Key`    BIGINT    NOT NULL,
                           `userNm`    BIGINT    NOT NULL,
                           `amount`    Int    NULL
);

CREATE TABLE `Exchange` (
                            `exchangeNm`    BIGINT    NOT NULL,
                            `userNm`    BIGINT    NOT NULL,
                            `amount`    INT    NULL,
                            `state`    enum('pending', 'approved', 'rejected')    NULL,
                            `applied_at`    TIMESTAMP    NULL,
                            `processed_at`    TIMESTAMP    NULL
);

CREATE TABLE `Eligibility` (
                               `eligibilityNm`    BIGINT    NOT NULL,
                               `scholarshipNm`    BIGINT    NOT NULL,
                               `field`    enum('gpa', 'grade', 'state')    NULL,
                               `operator`    enum('>=', '<=', '==', '>', '<')    NULL,
                               `value`    VARCHAR(255)    NULL,
                               `content`    TEXT    NULL
);

CREATE TABLE `ApplicationDocument` (
                                       `applicationDocumentNm`    BIGINT    NOT NULL,
                                       `userNm`    BIGINT    NOT NULL,
                                       `scholarshipNm`    BIGINT    NOT NULL,
                                       `file_url`    VARCHAR(500)    NULL,
                                       `uploaded_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP    NULL
);

CREATE TABLE `Document` (
                            `DocumentNm`    BIGINT    NOT NULL,
                            `scholarshipNm`    BIGINT    NOT NULL,
                            `name`    VARCHAR(255)    NULL,
                            `description`    TEXT    NULL
);

CREATE TABLE `Mybox` (
                         `id`    BIGINT AUTO_INCREMENT    PRIMARY KEY,
                         `userNm`    VARCHAR(20)    NOT NULL,
                         `object_key_enc`    VARBINARY(512)    NULL,
                         `file_name_enc`    VARBINARY(512)    NULL,
                         `content_type`    VARCHAR(100)    NULL,
                         `size_bytes`    BIGINT    NULL,
                         `checksum_sha256`    CHAR(64)    NULL,
                         `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
                         `updated_at`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 세션 문자셋 권장
SET NAMES utf8mb4;
SET time_zone = '+09:00';

-- 1) 장학금 메인
CREATE TABLE Scholarship (
                             scholarshipNm           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                             scholarship_name        VARCHAR(255)    NOT NULL,            -- 장학금명 *
                             description             TEXT            NULL,                -- 상세 설명
                             type                    ENUM('ACADEMIC','FINANCIAL_AID','ACTIVITY','OTHER') NOT NULL, -- 장학금 종류 *
                             amount                  INT UNSIGNED    NOT NULL,            -- 지급 금액(원) *
                             number_of_recipients    INT UNSIGNED    NOT NULL,            -- 선발 인원 *
                             payment_method          ENUM('LUMP_SUM','INSTALLMENT') NOT NULL DEFAULT 'LUMP_SUM', -- 지급 방식 *

    -- 모집/심사/일정
                             recruitment_start_date  DATE            NULL,
                             recruitment_end_date    DATE            NOT NULL,            -- 모집 종료일 *
                             evaluation_start_date   DATE            NOT NULL,            -- 심사 시작일 *
                             interview_date          DATE            NULL,                -- 면접 예정일
                             result_announcement_date DATE           NOT NULL,            -- 결과 발표일 *
                             evaluation_method       ENUM('DOCUMENT_REVIEW','DOCUMENT_INTERVIEW') NOT NULL DEFAULT 'DOCUMENT_REVIEW',
                             recruitment_status      ENUM('DRAFT','OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',

    -- 신청 제한/자격
                             eligibility_condition   VARCHAR(500)    NOT NULL,            -- 지원 자격 조건 *
                             grade_restriction       VARCHAR(100)    NULL,                -- 예: 1학년 이상, 4학년만 등
                             major_restriction       VARCHAR(255)    NULL,                -- 예: 컴퓨터공학과, 경영학과
                             duplicate_allowed       TINYINT(1)      NOT NULL DEFAULT 1,  -- 중복 수혜 가능 여부
                             min_gpa                 DECIMAL(3,2)    NULL,                -- 최소 학점 (예: 3.00)

    -- 카테고리/태그
                             category                VARCHAR(100)    NULL,                -- 단일 카테고리(선택/입력)

    -- 문의처
                             contact_person_name     VARCHAR(100)    NOT NULL,            -- 담당자명 *
                             contact_phone           VARCHAR(50)     NOT NULL,            -- 연락처 *
                             contact_email           VARCHAR(255)    NOT NULL,            -- 이메일 *
                             office_location         VARCHAR(255)    NULL,                -- 사무실 위치
                             consultation_hours      VARCHAR(255)    NULL,                -- 상담 가능 시간(문자열)

    -- 메타
                             created_by              VARCHAR(100)    NULL,
                             created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 인덱스
                             INDEX idx_scholarship_status (recruitment_status),
                             INDEX idx_scholarship_dates  (recruitment_start_date, recruitment_end_date),
                             INDEX idx_type_category      (type, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2) 제출서류/평가 기준 (동적 리스트)
CREATE TABLE Scholarship_criteria (
                                      id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                      scholarship_id  BIGINT UNSIGNED NOT NULL,
                                      name            VARCHAR(255)    NOT NULL,   -- 항목명 (예: 성적증명서, 봉사시간)
                                      std_point       DECIMAL(6,2)    NULL,       -- 기준 점수(없으면 NULL 허용)
                                      weight_percent  TINYINT UNSIGNED NOT NULL,  -- 가중치(0~100)

                                      created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                      CONSTRAINT fk_criteria_scholarship
                                          FOREIGN KEY (scholarship_id) REFERENCES Scholarship(scholarshipNm)
                                              ON DELETE CASCADE
                                              ON UPDATE CASCADE,

                                      INDEX idx_criteria_scholarship (scholarship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) 태그 (다중 태그용)
CREATE TABLE Scholarship_tag (
                                 id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 scholarship_id  BIGINT UNSIGNED NOT NULL,
                                 tag             VARCHAR(50)     NOT NULL,

                                 CONSTRAINT fk_tag_scholarship
                                     FOREIGN KEY (scholarship_id) REFERENCES Scholarship(scholarshipNm)
                                         ON DELETE CASCADE
                                         ON UPDATE CASCADE,

                                 UNIQUE KEY uniq_scholarship_tag (scholarship_id, tag),
                                 INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) 공지 (제목/내용/첨부 이미지)
CREATE TABLE Scholarship_notice (
                                    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                    scholarship_id  BIGINT UNSIGNED NOT NULL,
                                    title           VARCHAR(255)    NOT NULL,   -- 공지 제목 *
                                    content         TEXT            NOT NULL,   -- 공지 내용 *
                                    image_url       VARCHAR(500)    NULL,       -- 첨부 이미지(옵션)
                                    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_notice_scholarship
                                        FOREIGN KEY (scholarship_id) REFERENCES Scholarship(scholarshipNm)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,

                                    INDEX idx_notice_scholarship (scholarship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Application` (
                               `userNm`    BIGINT    NOT NULL,
                               `scholarshipNm`    BIGINT    NOT NULL,
                               `state`    enum('pending', 'approved', 'rejected')    NULL,
                               `applied_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP    NULL,
                               `reason`    TEXT    NULL
);

CREATE TABLE `User` (
                        `userNm`    VARCHAR(20)    NOT NULL,
                        `userMileage`    INT    NULL,
                        `accountNm`    VARCHAR(100)    NULL,
                        `userId`    VARCHAR(100)    NULL,
                        `password`    VARCHAR(255)    NULL,
                        `userKey`    VARCHAR(100)    NULL,
                        `userName`    VARCHAR(100)    NULL,
                        `status`    ENUM('ENROLLED', 'LEAVE_OF_ABSENCE', 'GRADUATED', 'EXPELLED')    NULL,
                        `grade`    int    NULL,
                        `gpa`    DECIMAL(3,2)    NULL,
                        `createdAt`    DATETIME    NULL,
                        `updatedAt`    DATETIME    NULL,
                        `role`    enum('ADMIN', 'STUDENT','STAFF')    NULL,
                        `deptNm`    BIGINT    NOT NULL,
                        `collegeNm`    BIGINT    NOT NULL,
                        `univNm`    BIGINT    NOT NULL
);

CREATE TABLE `College` (
                           `collegeNm`    BIGINT    NOT NULL,
                           `univNm`    BIGINT    NOT NULL,
                           `name`    VARCHAR(255)    NULL
);

ALTER TABLE `Department` ADD CONSTRAINT `PK_DEPARTMENT` PRIMARY KEY (
                                                                     `deptNm`,
                                                                     `collegeNm`,
                                                                     `univNm`
    );

ALTER TABLE `University` ADD CONSTRAINT `PK_UNIVERSITY` PRIMARY KEY (
                                                                     `univNm`
    );

ALTER TABLE `Mileage` ADD CONSTRAINT `PK_MILEAGE` PRIMARY KEY (
                                                               `Key`,
                                                               `userNm`
    );

ALTER TABLE `Exchange` ADD CONSTRAINT `PK_EXCHANGE` PRIMARY KEY (
                                                                 `exchangeNm`,
                                                                 `userNm`
    );

ALTER TABLE `Eligibility` ADD CONSTRAINT `PK_ELIGIBILITY` PRIMARY KEY (
                                                                       `eligibilityNm`
    );

ALTER TABLE `ApplicationDocument` ADD CONSTRAINT `PK_APPLICATIONDOCUMENT` PRIMARY KEY (
                                                                                       `applicationDocumentNm`,
                                                                                       `userNm`,
                                                                                       `scholarshipNm`
    );

ALTER TABLE `Document` ADD CONSTRAINT `PK_DOCUMENT` PRIMARY KEY (
                                                                 `DocumentNm`
    );

-- Scholarship 테이블은 이미 CREATE TABLE에서 PRIMARY KEY 정의됨

ALTER TABLE `Application` ADD CONSTRAINT `PK_APPLICATION` PRIMARY KEY (
                                                                       `userNm`,
                                                                       `scholarshipNm`
    );

ALTER TABLE `User` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
                                                         `userNm`
    );

ALTER TABLE `User` ADD CONSTRAINT `FK_Department_TO_User_1` FOREIGN KEY (
                                                                         `deptNm`,
                                                                         `collegeNm`,
                                                                         `univNm`
    )
    REFERENCES `Department` (
                             `deptNm`,
                             `collegeNm`,
                             `univNm`
        );

ALTER TABLE `College` ADD CONSTRAINT `PK_COLLEGE` PRIMARY KEY (
                                                               `collegeNm`,
                                                               `univNm`
    );

ALTER TABLE `Department` ADD CONSTRAINT `FK_College_TO_Department_1` FOREIGN KEY (
                                                                                  `collegeNm`,
                                                                                  `univNm`
    )
    REFERENCES `College` (
                          `collegeNm`,
                          `univNm`
        );

ALTER TABLE `Mileage` ADD CONSTRAINT `FK_User_TO_Mileage_1` FOREIGN KEY (
                                                                         `userNm`
    )
    REFERENCES `User` (
                       `userNm`
        );

ALTER TABLE `Exchange` ADD CONSTRAINT `FK_User_TO_Exchange_1` FOREIGN KEY (
                                                                           `userNm`
    )
    REFERENCES `User` (
                       `userNm`
        );

ALTER TABLE `ApplicationDocument` ADD CONSTRAINT `FK_Application_TO_ApplicationDocument_1` FOREIGN KEY (
                                                                                                        `userNm`,
                                                                                                        `scholarshipNm`
    )
    REFERENCES `Application` (
                              `userNm`,
                              `scholarshipNm`
        );

ALTER TABLE `Application` ADD CONSTRAINT `FK_User_TO_Application_1` FOREIGN KEY (
                                                                                 `userNm`
    )
    REFERENCES `User` (
                       `userNm`
        );

ALTER TABLE `Application` ADD CONSTRAINT `FK_Scholarship_TO_Application_1` FOREIGN KEY (
                                                                                        `scholarshipNm`
    )
    REFERENCES `Scholarship` (
                              `scholarshipNm`
        );

ALTER TABLE `College` ADD CONSTRAINT `FK_University_TO_College_1` FOREIGN KEY (
                                                                               `univNm`
    )
    REFERENCES `University` (
                             `univNm`
        );

ALTER TABLE `Document` ADD CONSTRAINT `FK_Scholarship_TO_Document_1` FOREIGN KEY (
                                                                                  `scholarshipNm`
    )
    REFERENCES `Scholarship` (
                              `scholarshipNm`
        );

ALTER TABLE `Eligibility` ADD CONSTRAINT `FK_Scholarship_TO_Eligibility_1` FOREIGN KEY (
                                                                                        `scholarshipNm`
    )
    REFERENCES `Scholarship` (
                              `scholarshipNm`
        );