// src/lib/noticeStore.js
let DB = [
  { id:1, title:'긴급: 시스템 점검 안내', content:'학사 관리 시스템 점검으로 인해 일시적으로 서비스가 중단됩니다.',
    author:'최관리자', isMy:true, priority:'high', status:'published', category:'urgent',
    tags:['긴급','시스템점검'], publishDate:'2025-08-21T08:00:00', expireDate:'2025-08-21T18:00:00',
    views:234, comments:12, pin:true, allowComments:false, created:'2025-08-21' },
  { id:2, title:'2025학년도 1학기 장학금 신청 안내', content:'2025학년도 1학기 장학금 신청이 시작됩니다. 기간 내에 신청 바랍니다.',
    author:'김교수', isMy:true, priority:'high', status:'published', category:'scholarship',
    tags:['장학금','신청','1학기'], publishDate:'2025-08-20T09:00:00', expireDate:'2025-09-15T23:59:59',
    views:156, comments:8, pin:true, allowComments:true, created:'2025-08-20' },
  { id:3, title:'학사일정 변경 공지', content:'기말고사 일정이 변경되었습니다. 자세한 내용을 확인해주세요.',
    author:'이관리자', isMy:false, priority:'medium', status:'draft', category:'academic',
    tags:['학사일정','기말고사'], publishDate:null, expireDate:null,
    views:89, comments:3, pin:false, allowComments:true, created:'2025-08-19' },
];

export const listNotices = () => [...DB];
export const findNotice = (id) => DB.find(v => v.id === Number(id)) || null;
export const patchNotice = (id, patch) => {
  const i = DB.findIndex(v => v.id === Number(id));
  if (i < 0) return null;
  DB[i] = { ...DB[i], ...patch };
  return DB[i];
};
export const deleteNotice = (id) => { DB = DB.filter(v => v.id !== Number(id)); };
