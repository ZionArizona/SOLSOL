create table Application
(
    userNm        bigint                                   not null,
    scholarshipNm bigint                                   not null,
    state         enum ('pending', 'approved', 'rejected') null,
    applied_at    timestamp default CURRENT_TIMESTAMP      null,
    reason        text                                     null,
    primary key (userNm, scholarshipNm)
);

create table ApplicationDocument
(
    applicationDocumentNm bigint                              not null,
    userNm                bigint                              not null,
    scholarshipNm         bigint                              not null,
    file_url              varchar(500)                        null,
    uploaded_at           timestamp default CURRENT_TIMESTAMP null,
    original_file_name    varchar(255)                        null,
    file_size             bigint                              null,
    content_type          varchar(100)                        null,
    primary key (applicationDocumentNm, userNm, scholarshipNm)
);

create table College
(
    collegeNm bigint       not null,
    univNm    bigint       not null,
    name      varchar(255) null,
    primary key (collegeNm, univNm)
);

create table Department
(
    deptNm    bigint       not null,
    collegeNm bigint       not null,
    univNm    bigint       not null,
    Deptname  varchar(255) null,
    primary key (deptNm, collegeNm, univNm),
    constraint FK_College_TO_Department_1
        foreign key (collegeNm) references College (collegeNm)
);

create table Document
(
    DocumentNm    bigint       not null
        primary key,
    scholarshipNm bigint       not null,
    name          varchar(255) null,
    description   text         null
);

create table Eligibility
(
    eligibilityNm bigint                            not null
        primary key,
    scholarshipNm bigint                            not null,
    field         enum ('gpa', 'grade', 'state')    null,
    operator      enum ('>=', '<=', '==', '>', '<') null,
    value         varchar(255)                      null,
    content       text                              null
);

create table Exchange
(
    exchangeNm   bigint                                   not null,
    userNm       bigint                                   not null,
    amount       int                                      null,
    state        enum ('pending', 'approved', 'rejected') null,
    applied_at   timestamp                                null,
    processed_at timestamp                                null,
    primary key (exchangeNm, userNm)
);

create table Mileage
(
    `Key`  bigint not null,
    userNm bigint not null,
    amount int    null,
    primary key (`Key`, userNm)
);

create table Mybox
(
    id              bigint auto_increment
        primary key,
    userNm          varchar(20)                        not null,
    object_key_enc  varbinary(512)                     null,
    file_name_enc   varbinary(512)                     null,
    content_type    varchar(100)                       null,
    size_bytes      bigint                             null,
    checksum_sha256 char(64)                           null,
    created_at      datetime default CURRENT_TIMESTAMP null,
    updated_at      datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table Mybox_audit
(
    id              bigint auto_increment
        primary key,
    mybox_id        bigint                                           not null,
    actor_userNm    varchar(20)                                      null,
    action          enum ('CREATE', 'DOWNLOAD_URL_ISSUED', 'DELETE') null,
    object_key_enc  varbinary(512)                                   null,
    file_name_enc   varbinary(512)                                   null,
    size_bytes      bigint                                           null,
    checksum_sha256 char(64)                                         null,
    s3_etag         varchar(80)                                      null,
    s3_version_id   varchar(200)                                     null,
    actor_ip        varchar(64)                                      null,
    user_agent      varchar(255)                                     null,
    detail          json                                             null,
    created_at      datetime default CURRENT_TIMESTAMP               null
);

create table University
(
    univNm       bigint       not null
        primary key,
    univName     varchar(255) null,
    mileageRatio double       null
);

create table User
(
    userNm      varchar(20)                                                    not null
        primary key,
    userMileage int                                                            null,
    accountNm   varchar(100)                                                   null,
    userId      varchar(100)                                                   null,
    password    varchar(255)                                                   null,
    userKey     varchar(100)                                                   null,
    userName    varchar(100)                                                   null,
    state       enum ('ENROLLED', 'LEAVE_OF_ABSENCE', 'GRADUATED', 'EXPELLED') null,
    grade       int                                                            null,
    gpa         decimal(3, 2)                                                  null,
    createdAt   datetime                                                       null,
    updatedAt   datetime                                                       null,
    role        enum ('ADMIN', 'STUDENT', 'STAFF')                             null,
    deptNm      bigint                                                         not null,
    collegeNm   bigint                                                         not null,
    univNm      bigint                                                         not null
);

create table refresh_token
(
    userNm      varchar(20)          not null,
    userId      varchar(100)         not null,
    token       varchar(255)         not null
        primary key,
    issuedAt    datetime             not null,
    expiresAt   datetime             not null,
    revoked     tinyint(1) default 0 null,
    userAgent   varchar(255)         null,
    ip          varchar(45)          null,
    rotatedFrom varchar(255)         null,
    lastUsedAt  datetime             null
);

create index idx_expiresAt
    on refresh_token (expiresAt);

create index idx_revoked
    on refresh_token (revoked);

create index idx_userId
    on refresh_token (userId);

create index idx_userNm
    on refresh_token (userNm);

create table scholarship
(
    id                       bigint unsigned auto_increment
        primary key,
    scholarship_name         varchar(255)                                                             not null,
    description              text                                                                     null,
    type                     enum ('ACADEMIC', 'FINANCIAL_AID', 'ACTIVITY', 'OTHER')                  not null,
    amount                   int unsigned                                                             not null,
    number_of_recipients     int unsigned                                                             not null,
    payment_method           enum ('LUMP_SUM', 'INSTALLMENT')               default 'LUMP_SUM'        not null,
    recruitment_start_date   date                                                                     null,
    recruitment_end_date     date                                                                     not null,
    evaluation_start_date    date                                                                     not null,
    interview_date           date                                                                     null,
    result_announcement_date date                                                                     not null,
    evaluation_method        enum ('DOCUMENT_REVIEW', 'DOCUMENT_INTERVIEW') default 'DOCUMENT_REVIEW' not null,
    recruitment_status       enum ('DRAFT', 'OPEN', 'CLOSED')               default 'OPEN'            not null,
    eligibility_condition    varchar(500)                                                             not null,
    grade_restriction        varchar(100)                                                             null,
    major_restriction        varchar(255)                                                             null,
    duplicate_allowed        tinyint(1)                                     default 1                 not null,
    min_gpa                  decimal(3, 2)                                                            null,
    category                 varchar(100)                                                             null,
    contact_person_name      varchar(100)                                                             not null,
    contact_phone            varchar(50)                                                              not null,
    contact_email            varchar(255)                                                             not null,
    office_location          varchar(255)                                                             null,
    consultation_hours       varchar(255)                                                             null,
    created_by               varchar(100)                                                             null,
    created_at               datetime                                       default CURRENT_TIMESTAMP not null,
    updated_at               datetime                                       default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create index idx_scholarship_dates
    on scholarship (recruitment_start_date, recruitment_end_date);

create index idx_scholarship_status
    on scholarship (recruitment_status);

create index idx_type_category
    on scholarship (type, category);

create table scholarship_criteria
(
    id             bigint unsigned auto_increment
        primary key,
    scholarship_id bigint unsigned                    not null,
    name           varchar(255)                       not null,
    std_point      decimal(6, 2)                      null,
    weight_percent tinyint unsigned                   not null,
    created_at     datetime default CURRENT_TIMESTAMP not null,
    constraint fk_criteria_scholarship
        foreign key (scholarship_id) references scholarship (id)
            on update cascade on delete cascade
)
    charset = utf8mb4;

create index idx_criteria_scholarship
    on scholarship_criteria (scholarship_id);

create table scholarship_notice
(
    id             bigint unsigned auto_increment
        primary key,
    scholarship_id bigint unsigned                    not null,
    title          varchar(255)                       not null,
    content        text                               not null,
    image_url      varchar(500)                       null,
    created_at     datetime default CURRENT_TIMESTAMP not null,
    constraint fk_notice_scholarship
        foreign key (scholarship_id) references scholarship (id)
            on update cascade on delete cascade
)
    charset = utf8mb4;

create index idx_notice_scholarship
    on scholarship_notice (scholarship_id);

create table scholarship_tag
(
    id             bigint unsigned auto_increment
        primary key,
    scholarship_id bigint unsigned not null,
    tag            varchar(50)     not null,
    constraint uniq_scholarship_tag
        unique (scholarship_id, tag),
    constraint fk_tag_scholarship
        foreign key (scholarship_id) references scholarship (id)
            on update cascade on delete cascade
)
    charset = utf8mb4;

create index idx_tag
    on scholarship_tag (tag);

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

ALTER TABLE ApplicationDocument
  ADD COLUMN original_file_name varchar(255),
  ADD COLUMN file_size bigint,
  ADD COLUMN content_type varchar(100);

ALTER TABLE scholarship
    ADD COLUMN required_documents JSON NULL COMMENT '필수';

ALTER TABLE ApplicationDocument
    MODIFY COLUMN applicationDocumentNm bigint NOT NULL
    AUTO_INCREMENT;

ALTER TABLE Mileage
    MODIFY COLUMN `Key` bigint NOT NULL AUTO_INCREMENT;
