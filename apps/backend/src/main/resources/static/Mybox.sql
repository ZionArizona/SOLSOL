CREATE TABLE `mybox` (
                         `id`               BIGINT AUTO_INCREMENT NOT NULL,
                         `userNm`           VARCHAR(20) NOT NULL,
                         `object_key_enc`   VARBINARY(512) NULL,
                         `file_name_enc`    VARBINARY(512) NULL,
                         `content_type`     VARCHAR(100) NULL,
                         `size_bytes`       BIGINT NULL,
                         `checksum_sha256`  CHAR(64) NULL,
                         `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         KEY `idx_mybox_userNm` (`userNm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `mybox_audit` (
                               `id`               BIGINT AUTO_INCREMENT NOT NULL,
                               `mybox_id`         BIGINT NOT NULL,
                               `actor_userNm`     VARCHAR(20) NULL,
                               `action`           ENUM('CREATE','DOWNLOAD_URL_ISSUED','DELETE') NULL,
                               `object_key_enc`   VARBINARY(512) NULL,
                               `file_name_enc`    VARBINARY(512) NULL,
                               `size_bytes`       BIGINT NULL,
                               `checksum_sha256`  CHAR(64) NULL,
                               `s3_etag`          VARCHAR(80) NULL,
                               `s3_version_id`    VARCHAR(200) NULL,
                               `actor_ip`         VARCHAR(64) NULL,
                               `user_agent`       VARCHAR(255) NULL,
                               `detail`           JSON NULL,
                               `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (`id`),
                               KEY `idx_mybox_audit_file_time` (`mybox_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
