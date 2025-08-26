-- 대학교 테스트 데이터
INSERT INTO universities (university_name, university_code, location, established_year, university_type) VALUES
('서울대학교', 'SNU', '서울시 관악구', 1946, 'NATIONAL'),
('연세대학교', 'YU', '서울시 서대문구', 1885, 'PRIVATE'),
('고려대학교', 'KU', '서울시 성북구', 1905, 'PRIVATE'),
('KAIST', 'KAIST', '대전시 유성구', 1971, 'NATIONAL'),
('POSTECH', 'POSTECH', '경북 포항시', 1986, 'PRIVATE');

-- 단과대 테스트 데이터
INSERT INTO colleges (college_name, college_code, university_id, dean_name) VALUES
('공과대학', 'ENG', 1, '김공학'),
('경영대학', 'BUS', 1, '박경영'),
('문과대학', 'LIB', 1, '이문학'),
('의과대학', 'MED', 1, '최의학'),
('공과대학', 'ENG', 2, '윤공학'),
('경영대학', 'BUS', 2, '정경영'),
('생명과학대학', 'LIFE', 2, '한생명');

-- 학과 테스트 데이터
INSERT INTO departments (department_name, department_code, college_id, head_name) VALUES
('컴퓨터공학과', 'CSE', 1, '김컴퓨터'),
('전자공학과', 'EEE', 1, '박전자'),
('기계공학과', 'MEE', 1, '이기계'),
('경영학과', 'BA', 2, '최경영'),
('경제학과', 'ECON', 3, '정경제'),
('국어국문학과', 'KOR', 3, '한국어'),
('의학과', 'MED', 4, '의사김'),
('컴퓨터과학과', 'CS', 5, '송컴퓨터'),
('경영학과', 'BBA', 6, '강경영');

-- 사용자 테스트 데이터 (비밀번호는 "password123"을 BCrypt로 암호화한 값)
INSERT INTO users (user_id, user_nm, user_name, password, email, phone, birth_date, gender, address, university_id, college_id, department_id, student_id, grade, gpa, income, role) VALUES
('admin', 'admin', 'System Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin@solsol.com', '010-1234-5678', '1980-01-01', 'M', 'Seoul', 1, 1, 1, 'ADMIN001', 0, 4.5, 0, 'ADMIN'),
('student1', '김학생', '김철수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student1@solsol.com', '010-2345-6789', '2000-03-15', 'M', '서울시 관악구', 1, 1, 1, '2020001001', 3, 3.8, 3000000, 'STUDENT'),
('student2', '이학생', '이영희', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student2@solsol.com', '010-3456-7890', '1999-07-20', 'F', '서울시 서대문구', 2, 5, 8, '2019002001', 4, 4.2, 2500000, 'STUDENT'),
('student3', '박학생', '박민수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student3@solsol.com', '010-4567-8901', '2001-11-10', 'M', '경기도 수원시', 1, 2, 4, '2021001002', 2, 3.5, 4000000, 'STUDENT'),
('testuser', 'testuser', 'Test User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'test@solsol.com', '010-9999-9999', '2000-01-01', 'M', 'Seoul', 1, 1, 1, '2020999999', 3, 3.5, 3000000, 'STUDENT');

-- 장학금 테스트 데이터
INSERT INTO scholarships (scholarship_name, scholarship_type, provider, amount, application_start_date, application_end_date, eligibility_criteria, required_documents, selection_criteria, university_id, grade_requirement, gpa_requirement, income_requirement) VALUES
('국가우수장학금', 'MERIT', '한국장학재단', 5000000, '2024-03-01', '2024-03-31', '성적우수자', '성적증명서, 소득증명서', 'GPA 3.8 이상', 1, 2, 3.8, 5000000),
('저소득층지원장학금', 'NEED', '한국장학재단', 3000000, '2024-02-15', '2024-04-15', '저소득층 학생', '소득증명서, 가족관계증명서', '소득 분위 하위 30%', null, 1, 2.5, 3000000),
('공학우수장학금', 'MERIT', '서울대학교', 2000000, '2024-04-01', '2024-04-30', '공과대학 재학생', '성적증명서, 추천서', 'GPA 3.5 이상', 1, 2, 3.5, 6000000);

-- 마일리지 테스트 데이터
INSERT INTO mileage (user_key, points, source, description) VALUES
(2, 1000, 'SIGNUP', '회원가입 축하 마일리지'),
(2, 500, 'SCHOLARSHIP_APPLICATION', '장학금 신청 완료'),
(2, 200, 'PROFILE_UPDATE', '프로필 업데이트 완료'),
(3, 1000, 'SIGNUP', '회원가입 축하 마일리지'),
(3, 300, 'RECOMMENDATION_SUBMIT', '추천서 제출 완료'),
(4, 1000, 'SIGNUP', '회원가입 축하 마일리지');

-- 장학금 신청 테스트 데이터 (legacy scholarship_applications 테이블)
INSERT INTO scholarship_applications (user_key, scholarship_id, status, submitted_documents, notes) VALUES
(2, 1, 'PENDING', '성적증명서, 소득증명서', '서류 검토 중'),
(3, 2, 'APPROVED', '소득증명서, 가족관계증명서', '승인 완료'),
(4, 3, 'REJECTED', '성적증명서, 추천서', 'GPA 기준 미달');

-- 장학금 신청 테스트 데이터 (새로운 application 테이블)
INSERT INTO application (user_nm, scholarship_nm, state, applied_at, reason) VALUES
('testuser', '국가우수장학금', 'PENDING', CURRENT_TIMESTAMP, '성적 우수자 장학금 신청'),
('admin', '저소득층지원장학금', 'PENDING', CURRENT_TIMESTAMP, '관리자 테스트 신청');

-- 학생증 테스트 데이터
INSERT INTO student_cards (user_key, card_number, issue_date, expiry_date, card_status) VALUES
(2, 'SNU-2020001001', '2020-03-01', '2024-02-29', 'ACTIVE'),
(3, 'YU-2019002001', '2019-03-01', '2023-02-28', 'EXPIRED'),
(4, 'SNU-2021001002', '2021-03-01', '2025-02-28', 'ACTIVE');

-- 알림 테스트 데이터
INSERT INTO notifications (user_key, title, message, notification_type, is_read) VALUES
(2, '장학금 신청 완료', '국가우수장학금 신청이 완료되었습니다.', 'SCHOLARSHIP', false),
(2, '마일리지 적립', '프로필 업데이트로 200 마일리지가 적립되었습니다.', 'MILEAGE', true),
(3, '장학금 승인', '저소득층지원장학금이 승인되었습니다.', 'SCHOLARSHIP', false),
(4, '장학금 거절', '공학우수장학금 신청이 거절되었습니다.', 'SCHOLARSHIP', true);

-- 추천서 테스트 데이터
INSERT INTO recommendations (user_key, recommender_name, recommender_position, recommender_email, relationship, content, status) VALUES
(2, '김교수', '컴퓨터공학과 교수', 'kim.prof@snu.ac.kr', 'PROFESSOR', '우수한 학생으로 적극 추천합니다.', 'APPROVED'),
(3, '이지도교수', '생명과학과 지도교수', 'lee.prof@yonsei.ac.kr', 'ADVISOR', '성실하고 열정적인 학생입니다.', 'PENDING');

-- 자기소개서 테스트 데이터
INSERT INTO personal_statements (user_key, title, content, version) VALUES
(2, '국가우수장학금 지원 동기', '저는 컴퓨터공학을 전공하며...', 1),
(3, '저소득층장학금 지원서', '경제적 어려움에도 불구하고...', 1),
(4, '공학우수장학금 자기소개서', '기계공학 분야에 대한 열정을...', 2);

-- 상담 테스트 데이터
INSERT INTO counseling (user_key, counselor_id, counseling_type, topic, content, status, scheduled_date, duration) VALUES
(2, 1, 'ACADEMIC', '학업 계획 상담', '대학원 진학에 대한 조언을 구하고 싶습니다.', 'SCHEDULED', '2024-09-01 14:00:00', 60),
(3, 1, 'CAREER', '진로 상담', '졸업 후 진로에 대해 고민이 많습니다.', 'COMPLETED', '2024-08-15 10:00:00', 90);

-- 결제 테스트 데이터
INSERT INTO payments (user_key, amount, payment_method, payment_status, transaction_id, description, payment_date) VALUES
(2, 50000, 'CARD', 'COMPLETED', 'TXN-20240825-001', '장학금 신청 수수료', '2024-08-25 09:30:00'),
(3, 30000, 'BANK_TRANSFER', 'COMPLETED', 'TXN-20240820-002', '서류 발급 수수료', '2024-08-20 15:45:00');