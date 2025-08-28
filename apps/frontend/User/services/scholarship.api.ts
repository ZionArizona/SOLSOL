import { apiClient, handleApiError } from './api';

// 장학금 관련 타입 정의 (백엔드 ScholarshipResponse에 맞게 수정)
export interface Scholarship {
  id: number;
  scholarshipName: string;
  description: string;
  type: string;
  amount: number;
  numberOfRecipients: number;
  paymentMethod: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  evaluationStartDate: string;
  interviewDate: string;
  resultAnnouncementDate: string;
  evaluationMethod: string;
  recruitmentStatus: 'OPEN' | 'CLOSED' | 'DRAFT';
  eligibilityCondition: string;
  gradeRestriction: string;
  majorRestriction: string;
  duplicateAllowed: boolean;
  minGpa: number;
  category: string;
  tags: string[];
  contactPersonName: string;
  contactPhone: string;
  contactEmail: string;
  officeLocation: string;
  consultationHours: string;
  notice: any;
  criteria: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Eligibility {
  field: string;
  operator: string;
  value: string;
  description: string;
}

export interface RequiredDocument {
  documentNm: number;
  name: string;
  isRequired: boolean;
  description?: string;
}

export interface ScholarshipListResponse {
  scholarships: Scholarship[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApplicationRequest {
  scholarshipNm: number;
  documents: {
    documentNm: number;
    fileUrl: string;
  }[];
}

export interface Application {
  applicationNm: number;
  scholarshipNm: number;
  scholarshipTitle: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt?: string;
}

// 필터링 매개변수 타입
export interface FilterParams {
  category?: string;
  status?: string;
  page?: number;
  size?: number;
}

// 장학금 API 서비스
export const scholarshipApi = {
  // 장학금 목록 조회
  async getScholarships(params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }): Promise<ScholarshipListResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = `/scholarships${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🎓 Fetching scholarships from:', endpoint);
      const response = await apiClient.get<ScholarshipListResponse>(endpoint);
      
      console.log('🎓 Scholarship API Response:', response);
      console.log('🎓 Response data:', response.data);
      console.log('🎓 Response success:', response.success);
      console.log('🎓 Response keys:', Object.keys(response || {}));
      
      if (response.success && response.data) {
        console.log('✅ Using success response structure');
        // response.data가 배열인지 확인
        if (Array.isArray(response.data)) {
          console.log('✅ Data is array, converting to ScholarshipListResponse');
          console.log('📋 First scholarship structure:', response.data[0]);
          console.log('📋 First scholarship keys:', Object.keys(response.data[0] || {}));
          return {
            scholarships: response.data,
            totalElements: response.data.length,
            totalPages: 1,
            currentPage: 0,
            pageSize: response.data.length
          };
        } else {
          console.log('✅ Data is already ScholarshipListResponse');
          return response.data;
        }
      } else if (Array.isArray(response.data)) {
        console.log('✅ Using direct array response');
        // 직접 배열인 경우 ScholarshipListResponse 형태로 변환
        return {
          scholarships: response.data,
          totalElements: response.data.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: response.data.length
        };
      } else if (response.data) {
        console.log('✅ Using response.data directly');
        return response.data;
      }
      
      console.log('❌ No valid response structure found');
      return null;
    } catch (error) {
      handleApiError(error, '장학금 목록을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 상세 조회
  async getScholarship(scholarshipId: number): Promise<Scholarship | null> {
    try {
      const response = await apiClient.get<Scholarship>(`/scholarships/${scholarshipId}`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '장학금 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 신청
  async applyScholarship(applicationData: ApplicationRequest): Promise<boolean> {
    try {
      const response = await apiClient.post('/applications', applicationData);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '장학금 신청에 실패했습니다.');
      return false;
    }
  },

  // 내 장학금 신청 목록 조회
  async getMyApplications(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ applications: Application[], totalElements: number } | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = `/applications/my${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ applications: Application[], totalElements: number }>(endpoint);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '신청 내역을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 신청 취소
  async cancelApplication(applicationId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/applications/${applicationId}`);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '신청 취소에 실패했습니다.');
      return false;
    }
  },

  // 장학금 신청 상세 조회
  async getApplicationDetail(applicationId: number): Promise<any | null> {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '신청서 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 사용자 맞춤 필터링된 장학금 목록 조회
  async getFilteredScholarships(params?: FilterParams): Promise<ScholarshipListResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());

      const endpoint = `/scholarships/filtered${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🎯 Fetching filtered scholarships from:', endpoint);
      const response = await apiClient.get<ScholarshipListResponse>(endpoint);
      
      console.log('🎯 Filtered Scholarship API Response:', response);
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return {
            scholarships: response.data,
            totalElements: response.data.length,
            totalPages: 1,
            currentPage: 0,
            pageSize: response.data.length
          };
        } else {
          return response.data;
        }
      } else if (Array.isArray(response.data)) {
        return {
          scholarships: response.data,
          totalElements: response.data.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: response.data.length
        };
      } else if (response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      handleApiError(error, '필터링된 장학금 목록을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 카테고리 목록 조회
  async getCategories(): Promise<string[] | null> {
    try {
      const response = await apiClient.get<string[]>('/scholarships/categories');
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '카테고리 목록을 불러오는데 실패했습니다.');
      return null;
    }
  }
};