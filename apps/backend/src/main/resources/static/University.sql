CREATE TABLE `University` (
    `univNm` BIGINT NOT NULL,
    `univName` VARCHAR(255) NULL,
    `mileageRatio` DOUBLE NULL,
    PRIMARY KEY (`univNm`)
);

CREATE TABLE `College` (
    `collegeNm` BIGINT NOT NULL,
    `univNm` BIGINT NOT NULL,
    `name` VARCHAR(255) NULL,
    PRIMARY KEY (`collegeNm`, `univNm`),
    CONSTRAINT `FK_University_TO_College_1` FOREIGN KEY (`univNm`)
        REFERENCES `University` (`univNm`)
);

CREATE TABLE `Department` (
    `deptNm` BIGINT NOT NULL,
    `collegeNm` BIGINT NOT NULL,
    `univNm` BIGINT NOT NULL,
    `name` VARCHAR(255) NULL,
    PRIMARY KEY (`deptNm`, `collegeNm`, `univNm`),
    CONSTRAINT `FK_College_TO_Department_1` FOREIGN KEY (`collegeNm`, `univNm`)
        REFERENCES `College` (`collegeNm`, `univNm`)
);
