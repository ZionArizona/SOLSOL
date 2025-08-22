CREATE TABLE `Department` (
	`deptNm`	Long	NOT NULL,
	`collegeNm`	Long	NOT NULL,
	`univNm`	Long	NOT NULL,
	`name`	VARCHAR(255)	NULL
);

CREATE TABLE `University` (
	`univNm`	Long	NOT NULL,
	`univName`	String	NULL,
	`Field2`	double	NULL
);

CREATE TABLE `Mileage` (
	`Key`	BIGINT	NOT NULL,
	`userNm`	BIGINT	NOT NULL,
	`amount`	Int	NULL
);

CREATE TABLE `Exchange` (
	`exchangeNm`	BIGINT	NOT NULL,
	`userNm`	BIGINT	NOT NULL,
	`amount`	INT	NULL,
	`state`	enum('pending', 'approved', 'rejected')	NULL,
	`applied_at`	TIMESTAMP	NULL,
	`processed_at`	TIMESTAMP	NULL
);

CREATE TABLE `Eligibility` (
	`eligibilityNm`	BIGINT	NOT NULL,
	`scholarshipNm`	BIGINT	NOT NULL,
	`field`	enum('gpa', 'grade', 'state')	NULL,
	`operator`	enum('>=', '<=', '==', '>', '<')	NULL,
	`value`	String	NULL,
	`content`	TEXT	NULL
);

CREATE TABLE `ApplicationDocument` (
	`applicationDocumentNm`	BIGINT	NOT NULL,
	`userNm`	BIGINT	NOT NULL,
	`scholarshipNm`	BIGINT	NOT NULL,
	`file_url`	VARCHAR(500)	NULL,
	`uploaded_at`	CURRENT_TIMESTAMP	NULL
);

CREATE TABLE `Document` (
	`DocumentNm`	BIGINT	NOT NULL,
	`scholarshipNm`	BIGINT	NOT NULL,
	`name`	VARCHAR(255)	NULL,
	`description`	TEXT	NULL
);

CREATE TABLE `Scholarship` (
	`scholarshipNm`	BIGINT	NOT NULL,
	`title`	String	NULL,
	`description`	TEXT	NULL,
	`start_date`	TIMESTAMP	NULL,
	`end_date`	TIMESTAMP	NULL,
	`created_by`	String	NULL,
	`created_at`	TIMESTAMP	NULL,
	`review_duration`	Int	NULL,
	`amount`	VARCHAR(255)	NULL
);

CREATE TABLE `Application` (
	`userNm`	BIGINT	NOT NULL,
	`scholarshipNm`	BIGINT	NOT NULL,
	`state`	enum('pending', 'approved', 'rejected')	NULL,
	`applied_at`	DEFAULT	NULL	DEFAULT CURRENT_TIMESTAMP,
	`reason`	TEXT	NULL
);

CREATE TABLE `User` (
	`userNm`	BIGINT	NOT NULL,
	`userMileage`	INT	NULL,
	`accountNm`	String	NULL,
	`userId`	String	NULL,
	`password`	String	NULL,
	`userKey`	String	NULL,
	`userName`	String	NULL,
	`state`	ENUM('ENROLLED', 'LEAVE_OF_ABSENCE', 'GRADUATED', 'EXPELLED')	NULL,
	`grade`	int	NULL,
	`gpa`	DECIMAL(3,2)	NULL,
	`createdAt`	String	NULL,
	`updatedAt`	String	NULL,
	`role`	enum('admin', 'student','staff')	NULL,
	`deptNm`	Long	NOT NULL,
	`collegeNm`	Long	NOT NULL,
	`univNm`	Long	NOT NULL
);

CREATE TABLE `College` (
	`collegeNm`	Long	NOT NULL,
	`univNm`	Long	NOT NULL,
	`name`	VARCHAR(255)	NULL
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

