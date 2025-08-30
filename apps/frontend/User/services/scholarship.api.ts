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
  requiredDocuments: RequiredDocument[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationState = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ScholarshipWithStateResponse {
  scholarship: Scholarship;
  state: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Eligibility {
  field: string;
  operator: string;
  value: string;
  description: string;
}

export interface RequiredDocument {
  name: string;
  keywords: string[];
  required: boolean;
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
      const response = await apiClient.get<ScholarshipListResponse>(endpoint);

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
      handleApiError(error, '장학금 목록을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 상세 조회
  async getScholarship(scholarshipId: number): Promise<Scholarship | null> {
    try {
      const response = await apiClient.get<Scholarship>(`/scholarships/${scholarshipId}`);
      if (response.success) return response.data;
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
      return !!response.success;
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
      if (response.success) return response.data;
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
      return !!response.success;
    } catch (error) {
      handleApiError(error, '신청 취소에 실패했습니다.');
      return false;
    }
  },

  // 장학금 신청 상세 조회
  async getApplicationDetail(applicationId: number): Promise<any | null> {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      if (response.success) return response.data;
      return null;
    } catch (error) {
      handleApiError(error, '신청서 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 필터링된 장학금 목록(배열 또는 PageResponse 그대로 반환)
  async getFilteredScholarships(
    params?: FilterParams
  ): Promise<PageResponse<ScholarshipWithStateResponse> | ScholarshipWithStateResponse[] | null> {
    try {
      const qs = new URLSearchParams();
      if (params?.category) qs.append('category', params.category);
      if (params?.status)   qs.append('status', params.status);
      if (params?.page !== undefined) qs.append('page', String(params.page));
      if (params?.size !== undefined) qs.append('size', String(params.size));

      const endpoint = `/scholarships/filtered${qs.toString() ? `?${qs.toString()}` : ''}`;
      const res = await apiClient.get<any>(endpoint);
      return res?.data ?? null; // 배열이든 PageResponse든 그대로 반환
    } catch (e) {
      handleApiError(e, '필터링된 장학금 목록을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 장학금 카테고리 목록 조회
  async getCategories(): Promise<string[] | null> {
    try {
      const response = await apiClient.get<string[]>('/scholarships/categories');
      if (response.success && response.data) return response.data;
      return null;
    } catch (error) {
      handleApiError(error, '카테고리 목록을 불러오는데 실패했습니다.');
      return null;
    }
  }
};
