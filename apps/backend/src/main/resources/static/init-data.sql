-- 기본 데이터 삽입 스크립트
-- 테스트용 기본 데이터

-- 1. University 데이터
INSERT INTO `University` (`univNm`, `univName`, `mileageRatio`) VALUES 
(1, '서울대학교', 1.0),
(2, '연세대학교', 0.9),
(3, '고려대학교', 0.9),
(4, 'KAIST', 1.0),
(5, '성균관대학교', 0.85);

-- 2. College 데이터
INSERT INTO `College` (`collegeNm`, `univNm`, `name`) VALUES 
(1, 1, '공과대학'),
(2, 1, '자연과학대학'),
(3, 1, '인문대학'),
(4, 1, '사회과학대학'),
(5, 1, '경영대학'),
(1, 2, '공과대학'),
(2, 2, '이과대학'),
(3, 2, '문과대학'),
(4, 2, '경영대학'),
(1, 3, '공과대학');

-- 3. Department 데이터
INSERT INTO `Department` (`deptNm`, `collegeNm`, `univNm`, `Deptname`) VALUES 
(1, 1, 1, '컴퓨터공학과'),
(2, 1, 1, '전기전자공학과'),
(3, 1, 1, '기계공학과'),
(4, 2, 1, '수학과'),
(5, 2, 1, '물리학과'),
(6, 3, 1, '국어국문학과'),
(7, 3, 1, '영어영문학과'),
(8, 4, 1, '경제학과'),
(9, 4, 1, '정치학과'),
(10, 5, 1, '경영학과');

-- 디폴트 학과 (테스트용)
INSERT INTO `Department` (`deptNm`, `collegeNm`, `univNm`, `Deptname`) VALUES 
(999, 999, 999, '미지정학과')
ON DUPLICATE KEY UPDATE `Deptname` = '미지정학과';

INSERT INTO `College` (`collegeNm`, `univNm`, `name`) VALUES 
(999, 999, '미지정단과대')
ON DUPLICATE KEY UPDATE `name` = '미지정단과대';

INSERT INTO `University` (`univNm`, `univName`, `mileageRatio`) VALUES 
(999, '미지정대학교', 0.5)
ON DUPLICATE KEY UPDATE `univName` = '미지정대학교';