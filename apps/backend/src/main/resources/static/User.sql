CREATE TABLE `User` (
                        `userNm`       VARCHAR(20) NOT NULL, -- 학번(문자형), PK
                        `userMileage`  INT NULL,
                        `accountNm`    VARCHAR(100) NULL,
                        `userId`       VARCHAR(100) NULL,  -- 로그인 ID라면 UNIQUE 권장
                        `password`     VARCHAR(255) NOT NULL,
                        `userKey`      VARCHAR(100) NULL,
                        `userName`     VARCHAR(100) NULL,
                        `state`        ENUM('ENROLLED','LEAVE_OF_ABSENCE','GRADUATED','EXPELLED') NULL,
                        `grade`        INT NULL,
                        `gpa`          DECIMAL(3,2) NULL,
                        `createdAt`    DATETIME DEFAULT CURRENT_TIMESTAMP,
                        `updatedAt`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        `role`         ENUM('ADMIN','STUDENT','STAFF') NULL,
                        `deptNm`       BIGINT NOT NULL,
                        `collegeNm`    BIGINT NOT NULL,
                        `univNm`       BIGINT NOT NULL,
                        PRIMARY KEY (`userNm`),
                        UNIQUE KEY `UK_User_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `refresh_token` (
                                 `id` BIGINT NOT NULL AUTO_INCREMENT,
                                 `userNm` VARCHAR(20) NOT NULL,
                                 `userId` VARCHAR(100) NOT NULL,
                                 `token` VARCHAR(64) NOT NULL,              -- JTI
                                 `issuedAt` DATETIME NOT NULL,
                                 `expiresAt` DATETIME NOT NULL,
                                 `revoked` TINYINT(1) NOT NULL DEFAULT 0,
                                 `userAgent` VARCHAR(255) NULL,
                                 `ip` VARCHAR(64) NULL,
                                 `rotatedFrom` VARCHAR(64) NULL,
                                 `lastUsedAt` DATETIME NULL,
                                 PRIMARY KEY (`id`),
                                 UNIQUE KEY `UK_refresh_token_token` (`token`),
                                 KEY `IDX_refresh_userNm` (`userNm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IDX_User_userKey ON `User` (`userKey`);
