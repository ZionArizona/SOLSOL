import { api } from '../utils/api'

// 장학금 관련 API 함수들
export const scholarshipApi = {
  // 전체 장학금 목록 조회
  getScholarships: async () => {
    try {
      const response = await api.get('/scholarships')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch scholarships:', error)
      throw error
    }
  },

  // 특정 장학금 상세 조회
  getScholarship: async (id) => {
    try {
      const response = await api.get(`/scholarships/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch scholarship ${id}:`, error)
      throw error
    }
  },

  // 장학금 생성
  createScholarship: async (data) => {
    try {
      const response = await api.post('/scholarships', data)
      return response.data
    } catch (error) {
      console.error('Failed to create scholarship:', error)
      throw error
    }
  },

  // 장학금 수정
  updateScholarship: async (id, data) => {
    try {
      const response = await api.put(`/scholarships/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update scholarship ${id}:`, error)
      throw error
    }
  },

  // 장학금 삭제
  deleteScholarship: async (id) => {
    try {
      await api.delete(`/scholarships/${id}`)
      return true
    } catch (error) {
      console.error(`Failed to delete scholarship ${id}:`, error)
      throw error
    }
  },

  // Criteria 관련 API
  getCriteria: async (scholarshipId) => {
    try {
      const response = await api.get(`/scholarships/${scholarshipId}/criteria`)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch criteria:', error)
      throw error
    }
  },

  createCriteria: async (scholarshipId, criteria) => {
    try {
      const response = await api.post(`/scholarships/${scholarshipId}/criteria`, criteria)
      return response.data
    } catch (error) {
      console.error('Failed to create criteria:', error)
      throw error
    }
  },

  updateCriteria: async (scholarshipId, criteriaId, criteria) => {
    try {
      const response = await api.put(`/scholarships/${scholarshipId}/criteria/${criteriaId}`, criteria)
      return response.data
    } catch (error) {
      console.error('Failed to update criteria:', error)
      throw error
    }
  },

  deleteCriteria: async (scholarshipId, criteriaId) => {
    try {
      await api.delete(`/scholarships/${scholarshipId}/criteria/${criteriaId}`)
      return true
    } catch (error) {
      console.error('Failed to delete criteria:', error)
      throw error
    }
  },

  // Tags 관련 API
  getTags: async (scholarshipId) => {
    try {
      const response = await api.get(`/scholarships/${scholarshipId}/tags`)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      throw error
    }
  },

  createTags: async (scholarshipId, tags) => {
    try {
      const response = await api.post(`/scholarships/${scholarshipId}/tags`, { tags })
      return response.data
    } catch (error) {
      console.error('Failed to create tags:', error)
      throw error
    }
  },

  deleteTag: async (scholarshipId, tagId) => {
    try {
      await api.delete(`/scholarships/${scholarshipId}/tags/${tagId}`)
      return true
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw error
    }
  },

  // Notices 관련 API
  getNotices: async (scholarshipId) => {
    try {
      const response = await api.get(`/scholarships/${scholarshipId}/notices`)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch notices:', error)
      throw error
    }
  },

  createNotice: async (scholarshipId, notice) => {
    try {
      const response = await api.post(`/scholarships/${scholarshipId}/notices`, notice)
      return response.data
    } catch (error) {
      console.error('Failed to create notice:', error)
      throw error
    }
  },

  updateNotice: async (scholarshipId, noticeId, notice) => {
    try {
      const response = await api.put(`/scholarships/${scholarshipId}/notices/${noticeId}`, notice)
      return response.data
    } catch (error) {
      console.error('Failed to update notice:', error)
      throw error
    }
  },

  deleteNotice: async (scholarshipId, noticeId) => {
    try {
      await api.delete(`/scholarships/${scholarshipId}/notices/${noticeId}`)
      return true
    } catch (error) {
      console.error('Failed to delete notice:', error)
      throw error
    }
  },

  // 장학금 카테고리 목록 조회
  getCategories: async () => {
    try {
      const response = await api.get('/scholarships/categories')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    }
  }
}

// 유틸리티 함수들
export const scholarshipUtils = {
  // 장학금 타입 라벨 변환
  getTypeLabel: (type) => {
    const typeMap = {
      'ACADEMIC': '성적우수',
      'FINANCIAL_AID': '생활지원',
      'ACTIVITY': '활동우수',
      'OTHER': '기타'
    }
    return typeMap[type] || '일반'
  },

  // 모집 상태 라벨 변환
  getStatusLabel: (status) => {
    const statusMap = {
      'DRAFT': '임시저장',
      'OPEN': '모집중',
      'CLOSED': '모집완료'
    }
    return statusMap[status] || '알 수 없음'
  },

  // 지급 방식 라벨 변환
  getPaymentMethodLabel: (method) => {
    const methodMap = {
      'LUMP_SUM': '일시지급',
      'INSTALLMENT': '분할지급'
    }
    return methodMap[method] || '일시지급'
  },

  // 심사 방식 라벨 변환
  getEvaluationMethodLabel: (method) => {
    const methodMap = {
      'DOCUMENT_REVIEW': '서류 심사',
      'DOCUMENT_INTERVIEW': '서류 + 면접'
    }
    return methodMap[method] || '서류 심사'
  },

  // 날짜 포맷팅
  formatDate: (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  },

  // 장학금 데이터 변환 (프론트엔드용)
  transformForFrontend: (scholarship) => ({
    id: scholarship.id,
    title: scholarship.scholarshipName,
    tag: scholarshipUtils.getStatusLabel(scholarship.recruitmentStatus),
    amount: `${scholarship.amount?.toLocaleString() || 0}원`,
    picks: `${scholarship.numberOfRecipients || 0}명`,
    applied: '0명', // TODO: 실제 지원자 수 API 연동 시 수정
    status: scholarshipUtils.getStatusLabel(scholarship.recruitmentStatus),
    progress: scholarship.recruitmentStatus === 'OPEN' ? 50 : 0,
    method: scholarshipUtils.getEvaluationMethodLabel(scholarship.evaluationMethod),
    chips: [scholarshipUtils.getTypeLabel(scholarship.type)],
    
    // 상세 정보
    type: scholarshipUtils.getTypeLabel(scholarship.type),
    payMethod: scholarshipUtils.getPaymentMethodLabel(scholarship.paymentMethod),
    startDate: scholarshipUtils.formatDate(scholarship.recruitmentStartDate),
    endDate: scholarshipUtils.formatDate(scholarship.recruitmentEndDate),
    evaluationStartDate: scholarshipUtils.formatDate(scholarship.evaluationStartDate),
    interviewDate: scholarshipUtils.formatDate(scholarship.interviewDate),
    resultDate: scholarshipUtils.formatDate(scholarship.resultAnnouncementDate),
    eligibility: scholarship.eligibilityCondition,
    desc: scholarship.description,
    category: scholarship.category,
    
    // 제한 사항
    constraints: {
      gradeLimit: scholarship.gradeRestriction || '제한 없음',
      majorLimit: scholarship.majorRestriction || '제한 없음',
      duplicateAllowed: scholarship.duplicateAllowed,
      minGpa: scholarship.minGpa || ''
    },
    
    // 문의처
    contact: {
      manager: scholarship.contactPersonName,
      phone: scholarship.contactPhone,
      email: scholarship.contactEmail,
      office: scholarship.officeLocation,
      hours: scholarship.consultationHours
    },
    
    // 메타데이터
    createdAt: scholarshipUtils.formatDate(scholarship.createdAt),
    updatedAt: scholarshipUtils.formatDate(scholarship.updatedAt),
    createdBy: scholarship.createdBy
  }),

  // 백엔드용 데이터 변환
  transformForBackend: (formData) => {
    console.log('🔄 transformForBackend 입력 데이터:', formData);
    
    // Enum 매핑 함수들
    const getTypeEnum = (typeValue) => {
      // 이미 영어 enum 값인 경우 그대로 반환
      if (['ACADEMIC', 'FINANCIAL_AID', 'ACTIVITY', 'OTHER'].includes(typeValue)) {
        return typeValue;
      }
      
      // 한국어 레이블인 경우 변환
      const typeMap = {
        '성적우수': 'ACADEMIC',
        '생활지원': 'FINANCIAL_AID', 
        '공로/활동': 'ACTIVITY',
        '활동우수': 'ACTIVITY',
        '기타': 'OTHER'
      }
      return typeMap[typeValue] || 'OTHER'
    }
    
    const getPaymentMethodEnum = (payMethodValue) => {
      // 이미 영어 enum 값인 경우 그대로 반환
      if (['LUMP_SUM', 'INSTALLMENT'].includes(payMethodValue)) {
        return payMethodValue;
      }
      
      // 한국어 레이블인 경우 변환
      const payMap = {
        '일시지급': 'LUMP_SUM',
        '분할지급': 'INSTALLMENT'
      }
      return payMap[payMethodValue] || 'LUMP_SUM'
    }
    
    const getEvaluationMethodEnum = (methodValue) => {
      // 이미 영어 enum 값인 경우 그대로 반환
      if (['DOCUMENT_REVIEW', 'DOCUMENT_INTERVIEW'].includes(methodValue)) {
        return methodValue;
      }
      
      // 한국어 레이블인 경우 변환
      const methodMap = {
        '서류심사': 'DOCUMENT_REVIEW',
        '서류 심사': 'DOCUMENT_REVIEW',
        '서류 + 면접': 'DOCUMENT_INTERVIEW'
      }
      return methodMap[methodValue] || 'DOCUMENT_REVIEW'
    }
    
    const result = {
      scholarshipName: formData.title || formData.scholarshipName || '',
      description: formData.desc || formData.description || '',
      type: getTypeEnum(formData.type),
      amount: parseInt(typeof formData.amount === 'string' ? formData.amount.replace(/[^0-9]/g, '') : formData.amount) || 1,
      numberOfRecipients: parseInt(typeof formData.picks === 'string' ? formData.picks.replace(/[^0-9]/g, '') : formData.picks) || 1,
      paymentMethod: getPaymentMethodEnum(formData.payMethod || formData.paymentMethod),
      
      // 날짜 처리 - judge 객체에서 가져오기
      recruitmentStartDate: formData.startDate || formData.recruitmentStartDate || null,
      recruitmentEndDate: formData.endDate || formData.recruitmentEndDate || null,
      evaluationStartDate: formData.judge?.judgeStart || formData.evaluationStartDate || null,
      interviewDate: formData.judge?.interviewDate || formData.interviewDate || null,
      resultAnnouncementDate: formData.judge?.resultDate || formData.resultAnnouncementDate || null,
      
      evaluationMethod: getEvaluationMethodEnum(formData.judge?.mode || formData.method || formData.evaluationMethod),
      recruitmentStatus: formData.recruitmentStatus || 'OPEN',
      
      // 자격 조건
      eligibilityCondition: formData.eligibility || formData.eligibilityCondition || '',
      gradeRestriction: formData.constraints?.gradeLimit !== '제한 없음' ? (formData.constraints?.gradeLimit || null) : null,
      majorRestriction: formData.constraints?.majorLimit || formData.majorRestriction || null,
      duplicateAllowed: formData.constraints?.duplicateAllowed ?? formData.duplicateAllowed ?? true,
      minGpa: formData.constraints?.minGpa ? parseFloat(formData.constraints.minGpa) : (formData.minGpa ? parseFloat(formData.minGpa) : null),
      
      category: typeof formData.categories === 'string' ? formData.categories : (formData.category || ''),
      
      // 문의처
      contactPersonName: formData.contact?.manager || formData.contactPersonName || '',
      contactPhone: formData.contact?.phone || formData.contactPhone || '',
      contactEmail: formData.contact?.email || formData.contactEmail || '',
      officeLocation: formData.contact?.office || formData.officeLocation || null,
      consultationHours: formData.contact?.hours || formData.consultationHours || null,
      
      // 공지
      noticeTitle: formData.notice?.title || formData.noticeTitle || null,
      noticeContent: formData.notice?.content || formData.noticeContent || null,
      noticeImageUrl: formData.notice?.imageUrl || formData.noticeImageUrl || null,
      
      // 평가 기준 및 제출서류
      criteria: formData.criteria || [],
      requiredDocuments: formData.requiredDocuments || []
    };
    
    console.log('🔄 transformForBackend 출력 데이터:', result);
    return result;
  }
}

// 기존 함수들 (호환성을 위해 유지, 내부적으로 새 API 사용)
export const listScholarships = async () => {
  return await scholarshipApi.getScholarships()
}

export const findScholarship = async (id) => {
  return await scholarshipApi.getScholarship(id)
}

export const patchScholarship = async (id, patch) => {
  return await scholarshipApi.updateScholarship(id, patch)
}

export const deleteScholarship = async (id) => {
  return await scholarshipApi.deleteScholarship(id)
}