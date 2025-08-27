import { api } from '../utils/api'

// 공지사항 관련 API 함수들 (현재는 로컬 스토리지 기반, 추후 백엔드 연동 가능)
let DB = [
  { id:1, title:'긴급: 시스템 점검 안내', content:'학사 관리 시스템 점검으로 인해 일시적으로 서비스가 중단됩니다.',
    author:'최관리자', isMy:true, priority:'high', status:'published', category:'urgent',
    tags:['긴급','시스템점검'], publishDate:'2025-08-21T08:00:00', expireDate:'2025-08-21T18:00:00',
    views:234, comments:12, pin:true, allowComments:false, attach:false, created:'2025-08-21' },
  { id:2, title:'2025학년도 1학기 장학금 신청 안내', content:'2025학년도 1학기 장학금 신청이 시작됩니다. 기간 내에 신청 바랍니다.',
    author:'김교수', isMy:true, priority:'high', status:'published', category:'scholarship',
    tags:['장학금','신청','1학기'], publishDate:'2025-08-20T09:00:00', expireDate:'2025-09-15T23:59:59',
    views:156, comments:8, pin:true, allowComments:true, attach:true, created:'2025-08-20' },
  { id:3, title:'학사일정 변경 공지', content:'기말고사 일정이 변경되었습니다. 자세한 내용을 확인해주세요.',
    author:'이관리자', isMy:false, priority:'medium', status:'published', category:'academic',
    tags:['학사일정','기말고사'], publishDate:'2025-08-19T14:30:00', expireDate:null,
    views:89, comments:3, pin:false, allowComments:true, attach:false, created:'2025-08-19' },
  { id:4, title:'대학축제 부스 운영 안내', content:'다가오는 대학축제에서 부스를 운영할 동아리와 학과를 모집합니다.',
    author:'박교수', isMy:true, priority:'low', status:'draft', category:'event',
    tags:['축제','부스','모집'], publishDate:null, expireDate:'2025-10-31T23:59:59',
    views:0, comments:0, pin:false, allowComments:true, attach:true, created:'2025-08-18' },
  { id:5, title:'여름방학 도서관 이용시간 안내', content:'방학 기간 중 도서관 이용시간이 변경됩니다.',
    author:'정교수', isMy:true, priority:'medium', status:'scheduled', category:'general',
    tags:['도서관','이용시간','방학'], publishDate:'2025-08-25T10:00:00', expireDate:'2025-09-01T23:59:59',
    views:0, comments:0, pin:false, allowComments:true, attach:false, created:'2025-08-17' },
];

// 로컬 스토리지에서 데이터 로드
const STORAGE_KEY = 'notice_data'
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      DB = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load notices from storage:', error)
  }
}

// 로컬 스토리지에 데이터 저장
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB))
  } catch (error) {
    console.error('Failed to save notices to storage:', error)
  }
}

// 초기 데이터 로드
loadFromStorage()

export const noticeApi = {
  // 전체 공지사항 목록 조회
  getNotices: async () => {
    try {
      // 백엔드 API 호출
      const response = await api.get('/scholarships/notices')
      const backendData = response.data || []
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      return backendData.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        author: notice.scholarshipName || '알 수 없음', // 장학금명을 작성자로 사용
        isMy: true, // 모든 장학금 공지를 "내가 작성한 것"으로 처리
        priority: 'medium', // 기본값
        status: 'published', // 기본값
        category: 'scholarship', // 장학금 관련 공지
        tags: ['장학금'], // 기본 태그
        publishDate: notice.createdAt,
        expireDate: null,
        views: 0, // 백엔드에 조회수 필드가 없음
        comments: 0, // 백엔드에 댓글 필드가 없음
        allowComments: true, // 기본값
        attach: !!notice.imageUrl, // 이미지가 있으면 첨부파일 있음으로 처리
        created: notice.createdAt ? notice.createdAt.split('T')[0] : new Date().toISOString().slice(0, 10),
        scholarshipId: notice.scholarshipId,
        scholarshipName: notice.scholarshipName
      }))
    } catch (error) {
      console.error('Failed to fetch notices:', error)
      // API 호출 실패시 로컬 데이터로 폴백
      return [...DB]
    }
  },

  // 특정 공지사항 상세 조회
  getNotice: async (id) => {
    try {
      // 백엔드 API 호출
      const response = await api.get(`/scholarships/notices/${id}`)
      const notice = response.data
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      return {
        id: notice.id,
        title: notice.title,
        content: notice.content,
        author: notice.scholarshipName || '알 수 없음',
        isMy: true,
        priority: 'medium',
        status: 'published',
        category: 'scholarship',
        tags: ['장학금'],
        publishDate: notice.createdAt,
        expireDate: null,
        views: 0,
        comments: 0,
        allowComments: true,
        attach: !!notice.imageUrl,
        created: notice.createdAt ? notice.createdAt.split('T')[0] : new Date().toISOString().slice(0, 10),
        scholarshipId: notice.scholarshipId,
        scholarshipName: notice.scholarshipName,
        notice: {
          title: notice.title,
          content: notice.content
        }
      }
    } catch (error) {
      console.error(`Failed to fetch notice ${id}:`, error)
      // 실패 시 로컬 데이터에서 찾기
      return DB.find(v => v.id === Number(id)) || null
    }
  },

  // 공지사항 생성 (현재는 로컬 저장만 지원)
  createNotice: async (data) => {
    try {
      // TODO: 장학금 연결 없이 독립적인 공지 생성은 현재 백엔드에서 지원하지 않음
      // 로컬 저장으로 처리
      const id = Math.max(0, ...DB.map(v => v.id)) + 1
      const newNotice = {
        id,
        ...data,
        isMy: true,
        views: 0,
        comments: 0,
        attach: false,
        created: new Date().toISOString().slice(0, 10)
      }
      DB = [newNotice, ...DB]
      saveToStorage()
      return newNotice
    } catch (error) {
      console.error('Failed to create notice:', error)
      throw error
    }
  },

  // 공지사항 수정 (현재는 로컬 수정만 지원)
  updateNotice: async (id, data) => {
    try {
      // TODO: 장학금 공지 수정은 별도 엔드포인트 필요
      // 로컬 데이터에서 수정
      const index = DB.findIndex(v => v.id === Number(id))
      if (index < 0) throw new Error('Notice not found')
      DB[index] = { ...DB[index], ...data }
      saveToStorage()
      return DB[index]
    } catch (error) {
      console.error(`Failed to update notice ${id}:`, error)
      throw error
    }
  },

  // 공지사항 삭제 (현재는 로컬 삭제만 지원)
  deleteNotice: async (id) => {
    try {
      // TODO: 장학금 공지 삭제는 별도 엔드포인트와 권한 체크 필요
      // 로컬 데이터에서 삭제
      DB = DB.filter(v => v.id !== Number(id))
      saveToStorage()
      return true
    } catch (error) {
      console.error(`Failed to delete notice ${id}:`, error)
      throw error
    }
  },

  // 조회수 증가
  incrementViews: async (id) => {
    try {
      const index = DB.findIndex(v => v.id === Number(id))
      if (index >= 0) {
        DB[index].views++
        saveToStorage()
      }
      return true
    } catch (error) {
      console.error(`Failed to increment views for notice ${id}:`, error)
      throw error
    }
  },

  // 고정/고정 해제
  togglePin: async (id) => {
    try {
      const index = DB.findIndex(v => v.id === Number(id))
      if (index >= 0) {
        DB[index].pin = !DB[index].pin
        saveToStorage()
        return DB[index]
      }
      return null
    } catch (error) {
      console.error(`Failed to toggle pin for notice ${id}:`, error)
      throw error
    }
  }
}

// 기존 함수들 (호환성을 위해 유지)
export const listNotices = async () => {
  return await noticeApi.getNotices()
}

export const findNotice = async (id) => {
  return await noticeApi.getNotice(id)
}

export const patchNotice = async (id, patch) => {
  return await noticeApi.updateNotice(id, patch)
}

export const deleteNotice = async (id) => {
  return await noticeApi.deleteNotice(id)
}
