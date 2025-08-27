import { apiClient, handleApiError } from './api';

// 장학금 관련 타입 정의
export interface Scholarship {
  scholarshipNm: number;
  title: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  reviewDuration: number;
  eligibilities?: Eligibility[];
  documents?: RequiredDocument[];
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
      
      if (response.success) {
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
  }
};