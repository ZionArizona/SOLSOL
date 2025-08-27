let DB = [
  {
    id: 1,
    title: '우수학생 학업장려 장학금',
    tag: '모집중',                // 모집중 | 모집예정 | 모집완료
    amount: '200만원',
    picks: 10,
    applied: 25,
    progress: 62,
    method: '서류 심사',
    chips: ['성적우수','가계곤란','복지','학기'],

    // 상세 필드
    type: '성적우수',
    payMethod: '일시지급',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    eligibility: '직전 학기 평점 3.5 이상, 결석 無',
    desc: '학업 성취가 우수한 학생에게 수여하는 장학금입니다.',
    categories: ['성적','학기'],

    constraints: { gradeLimit: '제한 없음', majorLimit: '', duplicateAllowed: true, minGpa: '3.0' },
    criteria: [
      { name:'성적증명서', std:'평점', weight:60 },
      { name:'교수추천서', std:'1부', weight:20 },
      { name:'활동보고서', std:'1부', weight:20 },
    ],
    judge: { mode:'서류심사', interviewDate:'', judgeStart:'2025-09-01', resultDate:'2025-09-10' },
    contact: { manager:'장학담당', phone:'010-0000-0000', email:'scholar@univ.ac.kr', office:'학생회관 201호', hours:'평일 09:00~18:00' },
    notice: { title:'장학금 신청 안내', content:'필수 서류를 기간 내에 제출하세요.' },

    createdAt: '2025-07-20', updatedAt: '2025-07-28'
  },
  {
    id: 2,
    title: '저소득층 생계비 지원 장학금',
    tag: '모집중',
    amount: '150만원',
    picks: 20,
    applied: 45,
    progress: 58,
    method: '서류 + 면접',
    chips: ['생활지원','저소득','복지'],

    type: '생활지원', payMethod:'분할지급',
    startDate:'2025-08-05', endDate:'2025-09-05',
    eligibility:'기초/차상위 증빙 가능자',
    desc:'생계 부담 완화를 위한 장학금입니다.',
    categories:['생활','복지'],
    constraints:{ gradeLimit:'제한 없음', majorLimit:'', duplicateAllowed:false, minGpa:'' },
    criteria:[{name:'소득분위 확인서', std:'증빙', weight:100}],
    judge:{ mode:'서류 + 면접', interviewDate:'2025-09-08', judgeStart:'2025-09-06', resultDate:'2025-09-12'},
    contact:{ manager:'학생처', phone:'02-000-0000', email:'life@univ.ac.kr', office:'학생처', hours:'평일 09:00~18:00'},
    notice:{ title:'저소득층 생계비 1차', content:'서류 누락 주의' },
    createdAt:'2025-07-22', updatedAt:'2025-07-28'
  }
];

export const listScholarships = () => [...DB];
export const findScholarship = (id) => DB.find(v => v.id === Number(id)) || null;
export const patchScholarship = (id, patch) => {
  const i = DB.findIndex(v => v.id === Number(id));
  if (i < 0) return null;
  DB[i] = { ...DB[i], ...patch, updatedAt: new Date().toISOString().slice(0,10) };
  return DB[i];
};
export const deleteScholarship = (id) => { DB = DB.filter(v => v.id !== Number(id)); };
