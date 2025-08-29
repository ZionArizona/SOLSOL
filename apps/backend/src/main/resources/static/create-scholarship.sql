/* =========================================================
   data.sql — Scholarship 더미 시드 (총 13개, idempotent)
   스키마 준수:
   - type: 'ACADEMIC' | 'FINANCIAL_AID' | 'ACTIVITY' | 'OTHER'
   - payment_method: 'LUMP_SUM' | 'INSTALLMENT'
   - evaluation_method: 'DOCUMENT_REVIEW' | 'DOCUMENT_INTERVIEW'
   - recruitment_end_date / evaluation_start_date / result_announcement_date: NOT NULL
   - required_documents: JSON
   ========================================================= */

-- 1) 성적우수 장학금 2025-1 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '성적우수 장학금 2025-1',
    '직전학기 성적 우수자를 위한 장학금',
    'ACADEMIC',
    2000000, 20, 'LUMP_SUM',
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() + INTERVAL 12 DAY,
    CURDATE() + INTERVAL 15 DAY,
    CURDATE() + INTERVAL 25 DAY,
    CURDATE() + INTERVAL 35 DAY,
    'DOCUMENT_INTERVIEW',
    'OPEN',
    '직전 학기 평점 3.8 이상',
    '1,2,3,4',
    '전체',
    1,
    3.80,
    '성적우수',
    '학생지원팀 홍길동', '02-1234-5678', 'aid@univ.ac.kr',
    '학생회관 2층', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','성적증명서','keywords',JSON_ARRAY('성적','GPA'),'required',TRUE),
    JSON_OBJECT('name','재학증명서','keywords',JSON_ARRAY('재학','학생'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='성적우수 장학금 2025-1');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '학업성적', 100.00, 70 FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='학업성적');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '봉사/활동', 10.00, 20 FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='봉사/활동');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '면접', 10.00, 10 FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='면접');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '성적' FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='성적');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '2025-1' FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='2025-1');

INSERT INTO scholarship_notice (scholarship_id, title, content, image_url, created_at)
SELECT s.id, '모집 공고', '성적우수 장학금 2025-1 모집을 시작합니다.', NULL, NOW()
FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_notice n WHERE n.scholarship_id=s.id AND n.title='모집 공고');



-- 2) 생활지원 장학금 2025 상반기 (CLOSED)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '생활지원 장학금 2025 상반기',
    '경제적 사정이 어려운 학생을 위한 생활비 지원',
    'FINANCIAL_AID',
    1500000, 50, 'INSTALLMENT',
    CURDATE() - INTERVAL 40 DAY,
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() - INTERVAL 3 DAY,
    NULL,
    CURDATE() + INTERVAL 3 DAY,
    'DOCUMENT_REVIEW',
    'CLOSED',
    '기초생활수급/차상위 우선',
    '전체',
    '전체',
    1,
    NULL,
    '생활지원',
    '학생복지과 김민수', '02-2222-3333', 'welfare@univ.ac.kr',
    '본관 1층', '평일 10:00~16:00',
    JSON_ARRAY(
    JSON_OBJECT('name','소득증빙서류','keywords',JSON_ARRAY('기초생활','차상위'),'required',TRUE),
    JSON_OBJECT('name','통장사본','keywords',JSON_ARRAY('계좌'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='생활지원 장학금 2025 상반기');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '생활지원' FROM scholarship s
WHERE s.scholarship_name='생활지원 장학금 2025 상반기'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='생활지원');



-- 3) 공로/활동 장학금 2025 특별 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '공로/활동 장학금 2025 특별',
    '동아리/학생회 등 교내외 공로 및 활동 실적 우수자 지원',
    'ACTIVITY',
    1000000, 30, 'LUMP_SUM',
    CURDATE() - INTERVAL 2 DAY,
    CURDATE() + INTERVAL 20 DAY,
    CURDATE() + INTERVAL 21 DAY,
    NULL,
    CURDATE() + INTERVAL 30 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '활동 증빙 필수',
    '전체',
    '전체',
    1,
    NULL,
    '공로/활동',
    '학생지원처 이지은', '02-7777-8888', 'activity@univ.ac.kr',
    '학생회관 3층', '평일 09:30~17:30',
    JSON_ARRAY(
    JSON_OBJECT('name','활동증빙자료','keywords',JSON_ARRAY('수상','동아리','학생회'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='공로/활동 장학금 2025 특별');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '활동실적', 100.00, 60 FROM scholarship s
WHERE s.scholarship_name='공로/활동 장학금 2025 특별'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='활동실적');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '포트폴리오', 100.00, 40 FROM scholarship s
WHERE s.scholarship_name='공로/활동 장학금 2025 특별'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='포트폴리오');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '활동' FROM scholarship s
WHERE s.scholarship_name='공로/활동 장학금 2025 특별'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='활동');

-- 4) 성적우수 장학금 2025-2 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '성적우수 장학금 2025-2',
    '연간 성적 최상위권 학생 대상 추가 장학금',
    'ACADEMIC',
    1800000, 15, 'LUMP_SUM',
    CURDATE() - INTERVAL 3 DAY,
    CURDATE() + INTERVAL 18 DAY,
    CURDATE() + INTERVAL 19 DAY,
    CURDATE() + INTERVAL 27 DAY,
    CURDATE() + INTERVAL 33 DAY,
    'DOCUMENT_INTERVIEW',
    'OPEN',
    '직전 학기 평점 3.7 이상',
    '1,2,3,4',
    '전체',
    1,
    3.70,
    '성적우수',
    '학생지원팀 박지훈', '02-1000-1000', 'honor2@univ.ac.kr',
    '학생회관 2층', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','성적증명서','keywords',JSON_ARRAY('성적','GPA'),'required',TRUE),
    JSON_OBJECT('name','재학증명서','keywords',JSON_ARRAY('재학'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='성적우수 장학금 2025-2');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '학업성적', 100.00, 80 FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-2'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='학업성적');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '면접', 20.00, 20 FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-2'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='면접');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '성적' FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-2'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='성적');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '2025-2' FROM scholarship s
WHERE s.scholarship_name='성적우수 장학금 2025-2'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='2025-2');



-- 5) 신입생 우수 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '신입생 우수 장학금 2025',
    '입학 성적/수시·정시 상위 합격자 대상',
    'ACADEMIC',
    1200000, 40, 'INSTALLMENT',
    CURDATE() - INTERVAL 1 DAY,
    CURDATE() + INTERVAL 25 DAY,
    CURDATE() + INTERVAL 26 DAY,
    NULL,
    CURDATE() + INTERVAL 40 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '입학 성적 우수(상위 10%) 또는 장학심사위원회 추천',
    '1',
    '전체',
    1,
    NULL,
    '성적우수',
    '입학처 김수현', '02-1111-2222', 'fresh@univ.ac.kr',
    '입학처 1층', '평일 10:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','고교생활기록부','keywords',JSON_ARRAY('내신','수능'),'required',TRUE),
    JSON_OBJECT('name','입학확인서','keywords',JSON_ARRAY('합격'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='신입생 우수 장학금 2025');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '입학성적', 100.00, 70 FROM scholarship s
WHERE s.scholarship_name='신입생 우수 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='입학성적');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '추천서', 10.00, 30 FROM scholarship s
WHERE s.scholarship_name='신입생 우수 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='추천서');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '신입생' FROM scholarship s
WHERE s.scholarship_name='신입생 우수 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='신입생');



-- 6) 생활지원 비상금 장학금 2025-하반기 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '생활지원 비상금 장학금 2025-하반기',
    '갑작스러운 경제적 곤란 학생 단기 지원',
    'FINANCIAL_AID',
    500000, 200, 'LUMP_SUM',
    CURDATE() - INTERVAL 7 DAY,
    CURDATE() + INTERVAL 10 DAY,
    CURDATE() + INTERVAL 11 DAY,
    NULL,
    CURDATE() + INTERVAL 18 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '긴급 상황 증빙 필요',
    '전체',
    '전체',
    1,
    NULL,
    '생활지원',
    '학생복지과 박민아', '02-3333-4444', 'emergency@univ.ac.kr',
    '본관 1층', '평일 09:30~16:30',
    JSON_ARRAY(
    JSON_OBJECT('name','긴급사유증빙','keywords',JSON_ARRAY('긴급','사고','질병'),'required',TRUE),
    JSON_OBJECT('name','통장사본','keywords',JSON_ARRAY('계좌'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='생활지원 비상금 장학금 2025-하반기');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '생활지원' FROM scholarship s
WHERE s.scholarship_name='생활지원 비상금 장학금 2025-하반기'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='생활지원');



-- 7) 공로/활동 리더십 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '공로/활동 리더십 장학금 2025',
    '학생회 임원/동아리 회장 등 리더십 활동 우수자',
    'ACTIVITY',
    800000, 25, 'LUMP_SUM',
    CURDATE() - INTERVAL 4 DAY,
    CURDATE() + INTERVAL 30 DAY,
    CURDATE() + INTERVAL 31 DAY,
    CURDATE() + INTERVAL 40 DAY,
    CURDATE() + INTERVAL 45 DAY,
    'DOCUMENT_INTERVIEW',
    'OPEN',
    '리더십 활동 증빙 자료 제출',
    '전체',
    '전체',
    1,
    NULL,
    '공로/활동',
    '학생지원처 최하늘', '02-5555-6666', 'leader@univ.ac.kr',
    '학생회관 3층', '평일 09:00~17:30',
    JSON_ARRAY(
    JSON_OBJECT('name','활동증빙자료','keywords',JSON_ARRAY('회장','간부','임원'),'required',TRUE),
    JSON_OBJECT('name','추천서','keywords',JSON_ARRAY('지도교수'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='공로/활동 리더십 장학금 2025');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '활동실적', 100.00, 60 FROM scholarship s
WHERE s.scholarship_name='공로/활동 리더십 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='활동실적');

INSERT INTO scholarship_criteria (scholarship_id, name, std_point, weight_percent)
SELECT s.id, '면접', 20.00, 40 FROM scholarship s
WHERE s.scholarship_name='공로/활동 리더십 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_criteria c WHERE c.scholarship_id=s.id AND c.name='면접');



-- 8) 연구지원 R&D 장학금 2025-1 (CLOSED)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '연구지원 R&D 장학금 2025-1',
    '학부 연구참여/학부생 R&D 프로젝트 지원',
    'OTHER',
    1000000, 35, 'INSTALLMENT',
    CURDATE() - INTERVAL 50 DAY,
    CURDATE() - INTERVAL 10 DAY,
    CURDATE() - INTERVAL 9 DAY,
    NULL,
    CURDATE() + INTERVAL 1 DAY,
    'DOCUMENT_REVIEW',
    'CLOSED',
    '연구계획서 제출 및 지도교수 추천',
    '2,3,4',
    '전체',
    1,
    NULL,
    '기타',
    '산학협력단 오세훈', '02-7777-1111', 'rnd@univ.ac.kr',
    '산학협력단 2층', '평일 10:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','연구계획서','keywords',JSON_ARRAY('계획','R&D'),'required',TRUE),
    JSON_OBJECT('name','지도교수추천서','keywords',JSON_ARRAY('추천'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='연구지원 R&D 장학금 2025-1');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '연구' FROM scholarship s
WHERE s.scholarship_name='연구지원 R&D 장학금 2025-1'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='연구');



-- 9) 지역인재 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '지역인재 장학금 2025',
    '지역사회 기여 및 지역 고교 출신 우대',
    'OTHER',
    700000, 60, 'LUMP_SUM',
    CURDATE() - INTERVAL 2 DAY,
    CURDATE() + INTERVAL 15 DAY,
    CURDATE() + INTERVAL 16 DAY,
    NULL,
    CURDATE() + INTERVAL 22 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '지역인재 증빙(졸업증명서 등) 제출',
    '전체',
    '전체',
    1,
    NULL,
    '기타',
    '대외협력처 정우성', '02-9090-9090', 'local@univ.ac.kr',
    '본관 3층', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','지역증빙서류','keywords',JSON_ARRAY('지역','출신고'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='지역인재 장학금 2025');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '지역' FROM scholarship s
WHERE s.scholarship_name='지역인재 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='지역');



-- 10) 해외교환 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '해외교환 장학금 2025',
    '해외 교환학생 선발자 등록금 일부 지원',
    'OTHER',
    1500000, 25, 'INSTALLMENT',
    CURDATE() - INTERVAL 6 DAY,
    CURDATE() + INTERVAL 28 DAY,
    CURDATE() + INTERVAL 29 DAY,
    NULL,
    CURDATE() + INTERVAL 45 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '교환학생 선발 확인서 제출',
    '2,3',
    '전체',
    1,
    NULL,
    '기타',
    '국제처 한소희', '02-1212-3434', 'exchange@univ.ac.kr',
    '국제처 2층', '평일 10:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','선발확인서','keywords',JSON_ARRAY('교환','해외'),'required',TRUE),
    JSON_OBJECT('name','어학성적표','keywords',JSON_ARRAY('IELTS','TOEIC','TOEFL'),'required',FALSE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='해외교환 장학금 2025');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '해외' FROM scholarship s
WHERE s.scholarship_name='해외교환 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='해외');



-- 11) 봉사 우수 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '봉사 우수 장학금 2025',
    '연간 봉사시간 및 공헌도 우수자',
    'ACTIVITY',
    600000, 80, 'LUMP_SUM',
    CURDATE() - INTERVAL 8 DAY,
    CURDATE() + INTERVAL 7 DAY,
    CURDATE() + INTERVAL 8 DAY,
    NULL,
    CURDATE() + INTERVAL 20 DAY,
    'DOCUMENT_REVIEW',
    'OPEN',
    '최근 1년 봉사 100시간 이상(증빙)',
    '전체',
    '전체',
    1,
    NULL,
    '공로/활동',
    '사회봉사센터 전지현', '02-8080-8080', 'volunteer@univ.ac.kr',
    '사회봉사센터', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','봉사활동증명서','keywords',JSON_ARRAY('VMS','1365'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='봉사 우수 장학금 2025');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '봉사' FROM scholarship s
WHERE s.scholarship_name='봉사 우수 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='봉사');



-- 12) 창업 도전 장학금 2025 (OPEN)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '창업 도전 장학금 2025',
    '학생 창업팀(예비/초기) 사업화 지원',
    'OTHER',
    2000000, 15, 'INSTALLMENT',
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() + INTERVAL 35 DAY,
    CURDATE() + INTERVAL 36 DAY,
    CURDATE() + INTERVAL 45 DAY,
    CURDATE() + INTERVAL 60 DAY,
    'DOCUMENT_INTERVIEW',
    'OPEN',
    '사업계획서 및 팀 구성 증빙',
    '전체',
    '전체',
    1,
    NULL,
    '기타',
    '창업보육센터 유재석', '02-4141-5151', 'startup@univ.ac.kr',
    '창업보육센터', '평일 10:00~18:00',
    JSON_ARRAY(
    JSON_OBJECT('name','사업계획서','keywords',JSON_ARRAY('사업','BM'),'required',TRUE),
    JSON_OBJECT('name','팀소개서','keywords',JSON_ARRAY('팀원','역할'),'required',TRUE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='창업 도전 장학금 2025');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '창업' FROM scholarship s
WHERE s.scholarship_name='창업 도전 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='창업');



-- 13) 체육특기 장학금 2025 (CLOSED)
INSERT INTO scholarship (
    scholarship_name, description, `type`, amount, number_of_recipients, payment_method,
    recruitment_start_date, recruitment_end_date, evaluation_start_date, interview_date, result_announcement_date,
    evaluation_method, recruitment_status, eligibility_condition, grade_restriction, major_restriction,
    duplicate_allowed, min_gpa, category, contact_person_name, contact_phone, contact_email,
    office_location, consultation_hours, required_documents, created_by, created_at
)
SELECT
    '체육특기 장학금 2025',
    '전국/시도 대회 입상자 및 대표선수',
    'ACTIVITY',
    2500000, 10, 'LUMP_SUM',
    CURDATE() - INTERVAL 60 DAY,
    CURDATE() - INTERVAL 15 DAY,
    CURDATE() - INTERVAL 14 DAY,
    NULL,
    CURDATE() - INTERVAL 5 DAY,
    'DOCUMENT_INTERVIEW',
    'CLOSED',
    '입상 증빙 및 경기력 평가',
    '1,2,3,4',
    '전체',
    1,
    NULL,
    '공로/활동',
    '체육진흥원 김연아', '02-9999-0000', 'athlete@univ.ac.kr',
    '체육관 1층', '평일 09:00~17:00',
    JSON_ARRAY(
    JSON_OBJECT('name','수상증명서','keywords',JSON_ARRAY('입상','대회'),'required',TRUE),
    JSON_OBJECT('name','경기영상','keywords',JSON_ARRAY('영상','하이라이트'),'required',FALSE)
    ),
    'system', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM scholarship WHERE scholarship_name='체육특기 장학금 2025');

INSERT INTO scholarship_tag (scholarship_id, tag)
SELECT s.id, '체육' FROM scholarship s
WHERE s.scholarship_name='체육특기 장학금 2025'
  AND NOT EXISTS (SELECT 1 FROM scholarship_tag t WHERE t.scholarship_id=s.id AND t.tag='체육');
