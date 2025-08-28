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
        if (response.data && Array.isArray(response.data)) {
          console.log('✅ Data is in data.data array');
          return response.data;
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
        if (response.data && Array.isArray(response.data)) {
          return response.data;
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

  // 특정 장학금에 대한 신청 정보 조회
  async getApplicationByScholarship(scholarshipId: number): Promise<Application | null> {
    try {
      const applications = await this.getMyApplications();
      return applications.find(app => app.scholarshipNm === scholarshipId) || null;
    } catch (error) {
      handleApiError(error, '신청 정보 조회에 실패했습니다.');
      return null;
    }
  },

  // 장학금 신청 수정
  async updateApplication(scholarshipId: number, reason: string): Promise<boolean> {
    try {
      // 일단 기존 신청을 취소하고 새로 신청하는 방식으로 구현
      await this.cancelApplication(scholarshipId);
      return await this.submitApplication({ scholarshipId, reason });
    } catch (error) {
      handleApiError(error, '신청 수정에 실패했습니다.');
      return false;
    }
  },

  // 장학금 신청 취소
  async cancelApplication(scholarshipId: number): Promise<boolean> {
    try {
      console.log('🔥 cancelApplication API 호출 시작, scholarshipId:', scholarshipId);
      const response = await apiClient.delete(`/applications/cancel/${scholarshipId}`);
      console.log('🔥 cancelApplication API 응답:', response);
      
      if (response.success) {
        console.log('✅ 신청 취소 성공');
        return true;
      }
      console.log('❌ 신청 취소 실패 - response.success가 false');
      return false;
    } catch (error) {
      console.error('🔥 cancelApplication API 에러:', error);
      handleApiError(error, '신청 취소에 실패했습니다.');
      return false;
    }
  }
};