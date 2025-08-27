import { apiClient, handleApiError } from './api';

// 장학금 신청 관련 타입 정의
export interface ApplicationRequest {
  scholarshipId: number;
  reason?: string;
}

export interface Application {
  userNm: string;
  scholarshipNm: number;
  scholarshipName: string;
  state: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reason?: string;
}

export interface ApplicationListResponse {
  applications: Application[];
  totalElements: number;
}

// 장학금 신청 API 서비스
export const applicationApi = {
  // 장학금 신청
  async submitApplication(applicationData: ApplicationRequest): Promise<boolean> {
    try {
      const response = await apiClient.post('/applications/apply', applicationData);
      
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
  async getMyApplications(): Promise<Application[]> {
    try {
      const response = await apiClient.get<Application[]>('/applications/my');
      
      console.log('📋 Application API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Using success response structure');
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Data is in data.data array');
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('✅ Data is direct array');
          return response.data;
        }
        return response.data;
      } else if (Array.isArray(response.data)) {
        console.log('✅ Using direct array response');
        return response.data;
      }
      
      console.log('❌ No valid response structure found');
      return [];
    } catch (error) {
      handleApiError(error, '신청 내역을 불러오는데 실패했습니다.');
      return [];
    }
  },

  // 상태별 내 장학금 신청 조회
  async getMyApplicationsByStatus(status: string): Promise<Application[]> {
    try {
      const response = await apiClient.get<Application[]>(`/applications/my/status/${status}`);
      
      if (response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
        return response.data;
      }
      return [];
    } catch (error) {
      handleApiError(error, '신청 내역을 불러오는데 실패했습니다.');
      return [];
    }
  },

  // 장학금 신청 취소
  async cancelApplication(scholarshipId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/applications/cancel/${scholarshipId}`);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '신청 취소에 실패했습니다.');
      return false;
    }
  }
};