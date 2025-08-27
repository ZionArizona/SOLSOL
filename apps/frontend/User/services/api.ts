import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API Base URL
export const BASE_URL = 'http://localhost:8080/api';

// API Response 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data: T;
}

// 토큰 관리 유틸리티
export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('토큰 조회 실패:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('리프레시 토큰 조회 실패:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  }
};

// HTTP 클라이언트 클래스
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await tokenManager.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      // HTTP 에러 처리
      let errorMessage = `요청에 실패했습니다. (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 에러 메시지 사용
      }

      // 사용자에게 알림 표시
      Alert.alert('오류', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (error) {
      const message = '서버 응답을 처리하는 중 오류가 발생했습니다.';
      Alert.alert('오류', message);
      throw new Error(message);
    }
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: ApiResponse<{accessToken: string, refreshToken: string}> = await response.json();
        await tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      // 리프레시 토큰도 만료된 경우
      await tokenManager.clearTokens();
      return false;
    } catch (error) {
      await tokenManager.clearTokens();
      return false;
    }
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      // 401 Unauthorized - 토큰 갱신 시도
      if (response.status === 401) {
        const refreshSuccess = await this.refreshTokenIfNeeded();
        if (refreshSuccess) {
          // 토큰 갱신 성공 - 요청 재시도
          const newHeaders = await this.getAuthHeaders();
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: { ...newHeaders, ...options.headers },
          });
          return await this.handleResponse<T>(retryResponse);
        } else {
          // 토큰 갱신 실패 - 로그인 페이지로 이동
          Alert.alert('알림', '로그인이 필요합니다.', [
            { 
              text: '확인', 
              onPress: () => {
                // TODO: 로그인 페이지로 네비게이션
                console.log('로그인 페이지로 이동 필요');
              }
            }
          ]);
          throw new Error('Authentication required');
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const message = '네트워크 연결을 확인해주세요.';
      Alert.alert('연결 오류', message);
      throw new Error(message);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스
export const apiClient = new ApiClient(BASE_URL);

// 에러 처리 유틸리티
export const handleApiError = (error: any, defaultMessage = '오류가 발생했습니다.') => {
  const message = error?.message || defaultMessage;
  Alert.alert('오류', message);
  console.error('API Error:', error);
};