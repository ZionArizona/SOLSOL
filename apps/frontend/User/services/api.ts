import { Alert, Platform } from 'react-native';
import tokenManager from '../utils/tokenManager';

// API Base URL
//export const BASE_URL = 'http://localhost:8080/api'; 
// const BASE_URL = __DEV__
//   ? (
//       Platform.OS === 'android'
//         ? 'http://10.0.2.2:8080/api'   // Android 에뮬레이터 → 로컬 호스트 접근
//         : 'http://localhost:8080/api'  // iOS 시뮬레이터
//     )
//   : 'https://heycalendar.store/api';   // 실제 배포(앱 빌드/실기기)

const ENV_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

const isWeb = Platform.OS === 'web';
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

const PROD_ORIGIN =
  isWeb
    ? (ENV_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : 'https://heycalendar.store'))
    : (ENV_ORIGIN || 'https://heycalendar.store');


export const BASE_URL = isDev
  ? (Platform.OS === 'android'
      ? 'http://10.0.2.2:8080/api'
      : 'http://localhost:8080/api')
  : `${PROD_ORIGIN}/api`;
// export const BASE_URL = __DEV__
//   ? (
//       Platform.OS === 'android'
//         ? 'http://10.0.2.2:8080/api'   // Android 에뮬레이터 → 로컬 호스트 접근
//         : 'http://localhost:8080/api'  // iOS 시뮬레이터
//     )
//   : 'https://heycalendar.store/api';   // 실제 배포(앱 빌드/실기기)


// API Response 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data: T;
}

// 토큰 관리는 utils/tokenManager.ts를 사용

// HTTP 클라이언트 클래스
class ApiClient {
  public baseURL: string; // private → public으로 변경하여 디버깅 시 접근 가능하도록

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    console.log('🏗️ ApiClient 생성됨. BASE_URL:', this.baseURL);
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await tokenManager.getAccessToken();
    console.log('🔑 API 토큰 상태:', token ? `토큰 있음 (${token.substring(0, 30)}...)` : '토큰 없음');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    // JWT 토큰에서 사용자명 추출하여 user-nm 헤더 추가
    if (token) {
      try {
        const userNm = this.extractUserFromToken(token);
        if (userNm) {
          headers['user-nm'] = userNm;
        }
      } catch (error) {
        console.warn('JWT 토큰에서 사용자명 추출 실패:', error);
      }
    }

    return headers;
  }

  private extractUserFromToken(token: string): string | null {
    try {
      const payload = tokenManager.decodeAccessToken(token);
      if (!payload) return null;
      
      console.log('🔍 JWT Payload:', payload);
      // 토큰에서 사용자명 추출
      const userNm = payload.sub || payload.userName || payload.userId || null;
      console.log('👤 Extracted userNm:', userNm);
      return userNm;
    } catch (error) {
      console.error('JWT 토큰 디코딩 오류:', error);
      return null;
    }
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
        console.log('🔄 리프레시 토큰이 없습니다');
        return false;
      }

      console.log('🔄 토큰 갱신 시도 중...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: ApiResponse<{accessToken: string, refreshToken: string}> = await response.json();
        await tokenManager.saveTokens(data.data);
        console.log('✅ 토큰 갱신 성공');
        return true;
      }

      // 리프레시 토큰도 만료된 경우
      console.log('❌ 리프레시 토큰 만료됨');
      await tokenManager.clearTokens();
      return false;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
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
      const fullURL = `${this.baseURL}${endpoint}`;
      
      console.log('🌐 HTTP 요청:', options.method || 'GET', fullURL);
      console.log('📋 요청 헤더:', JSON.stringify(headers, null, 2));
      console.log('📦 요청 본문:', options.body || 'undefined');
      
      const response = await fetch(fullURL, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
      
      console.log('📊 응답 상태:', response.status, response.statusText);
      console.log('📋 응답 헤더:', Object.fromEntries(response.headers.entries()));

      // 401 Unauthorized - 토큰 갱신 시도
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized error occurred');
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
      console.error('❌ HTTP 요청 실패:', error);
      console.error('🔍 에러 상세:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.substring(0, 200)
      });
      
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
    console.log('🔄 POST 요청 시작:', endpoint);
    console.log('📤 POST 데이터:', data ? JSON.stringify(data, null, 2) : 'undefined');
    
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('✅ POST 응답 완료:', endpoint);
    return result;
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