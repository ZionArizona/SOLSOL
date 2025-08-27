import { apiClient, handleApiError } from './api';

// 인증 관련 타입 정의
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface SignupRequest {
  userId: string;
  password: string;
  userName: string;
  email: string;
  grade: number;
  gpa: number;
  deptNm: number;
  collegeNm: number;
  univNm: number;
}

export interface SignupResponse {
  userNm: number;
  userId: string;
  userName: string;
  email: string;
  createdAt: string;
}

// 인증 API 서비스
export const authApi = {
  // 로그인
  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success) {
        // 토큰 저장
        const { accessToken, refreshToken } = response.data;
        await require('./api').tokenManager.setTokens(accessToken, refreshToken);
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '로그인에 실패했습니다.');
      return null;
    }
  },

  // 로그아웃
  async logout(): Promise<boolean> {
    try {
      const refreshToken = await require('./api').tokenManager.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
      
      // 로컬 토큰 삭제
      await require('./api').tokenManager.clearTokens();
      return true;
    } catch (error) {
      // 로그아웃은 실패해도 로컬 토큰은 삭제
      await require('./api').tokenManager.clearTokens();
      handleApiError(error, '로그아웃 중 오류가 발생했습니다.');
      return false;
    }
  },

  // 회원가입
  async signup(userData: SignupRequest): Promise<SignupResponse | null> {
    try {
      const response = await apiClient.post<SignupResponse>('/user/regist', userData);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '회원가입에 실패했습니다.');
      return null;
    }
  },

  // 토큰 갱신
  async refreshToken(): Promise<LoginResponse | null> {
    try {
      const refreshToken = await require('./api').tokenManager.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
      
      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await require('./api').tokenManager.setTokens(accessToken, newRefreshToken);
        return response.data;
      }
      return null;
    } catch (error) {
      // 리프레시 실패 시 토큰 삭제
      await require('./api').tokenManager.clearTokens();
      return null;
    }
  }
};