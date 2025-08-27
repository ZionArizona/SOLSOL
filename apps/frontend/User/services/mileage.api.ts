import { apiClient, handleApiError } from './api';

// 마일리지 관련 타입 정의
export interface MileageHistory {
  key: number;
  amount: number;
  type: 'EARNED' | 'USED';
  description: string;
  balance: number;
  createdAt: string;
}

export interface UserMileage {
  currentMileage: number;
  totalEarned: number;
  totalUsed: number;
  history: MileageHistory[];
}

export interface ExchangeRequest {
  amount: number;
  description?: string;
}

export interface Exchange {
  exchangeNm: number;
  amount: number;
  description: string;
  state: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
}

// 마일리지 API 서비스
export const mileageApi = {
  // 사용자 마일리지 조회
  async getUserMileage(): Promise<UserMileage | null> {
    try {
      const response = await apiClient.get<UserMileage>('/mileages/my');
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '마일리지 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 마일리지 히스토리 조회
  async getMileageHistory(params?: {
    page?: number;
    size?: number;
    type?: 'EARNED' | 'USED';
  }): Promise<{ history: MileageHistory[], totalElements: number } | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.type) queryParams.append('type', params.type);

      const endpoint = `/mileages/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ history: MileageHistory[], totalElements: number }>(endpoint);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '마일리지 히스토리를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 마일리지 환전 신청
  async requestExchange(exchangeData: ExchangeRequest): Promise<boolean> {
    try {
      const response = await apiClient.post('/exchanges', exchangeData);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '환전 신청에 실패했습니다.');
      return false;
    }
  },

  // 내 환전 신청 목록 조회
  async getMyExchanges(params?: {
    page?: number;
    size?: number;
    state?: string;
  }): Promise<{ exchanges: Exchange[], totalElements: number } | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.state) queryParams.append('state', params.state);

      const endpoint = `/exchanges/my${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ exchanges: Exchange[], totalElements: number }>(endpoint);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '환전 신청 내역을 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 환전 신청 취소
  async cancelExchange(exchangeId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/exchanges/${exchangeId}`);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '환전 취소에 실패했습니다.');
      return false;
    }
  }
};