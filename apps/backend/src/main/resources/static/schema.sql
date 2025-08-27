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

CREATE TABLE `Scholarship` (
    `scholarshipNm`    BIGINT    NOT NULL,
    `title`    VARCHAR(255)    NULL,
    `description`    TEXT    NULL,
    `start_date`    TIMESTAMP    NULL,
    `end_date`    TIMESTAMP    NULL,
    `created_by`    VARCHAR(255)    NULL,
    `created_at`    TIMESTAMP    NULL,
    `review_duration`    INT    NULL,
    `amount`    VARCHAR(255)    NULL
);

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
    `state`    ENUM('ENROLLED', 'LEAVE_OF_ABSENCE', 'GRADUATED', 'EXPELLED')    NULL,
    `grade`    int    NULL,
    `gpa`    DECIMAL(3,2)    NULL,
    `createdAt`    DATETIME    NULL,
    `updatedAt`    DATETIME    NULL,
    `role`    enum('admin', 'student','staff')    NULL,
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

ALTER TABLE `Scholarship` ADD CONSTRAINT `PK_SCHOLARSHIP` PRIMARY KEY (
    `scholarshipNm`
);

ALTER TABLE `Application` ADD CONSTRAINT `PK_APPLICATION` PRIMARY KEY (
    `userNm`,
    `scholarshipNm`
);

ALTER TABLE `User` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
    `userNm`
);

ALTER TABLE `College` ADD CONSTRAINT `PK_COLLEGE` PRIMARY KEY (
    `collegeNm`,
    `univNm`
);

ALTER TABLE `Department` ADD CONSTRAINT `FK_College_TO_Department_1` FOREIGN KEY (
    `collegeNm`
)
REFERENCES `College` (
    `collegeNm`
);

ALTER TABLE `Department` ADD CONSTRAINT `FK_College_TO_Department_2` FOREIGN KEY (
    `univNm`
)
REFERENCES `College` (
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
    `userNm`
)
REFERENCES `Application` (
    `userNm`
);

ALTER TABLE `ApplicationDocument` ADD CONSTRAINT `FK_Application_TO_ApplicationDocument_2` FOREIGN KEY (
    `scholarshipNm`
)
REFERENCES `Application` (
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