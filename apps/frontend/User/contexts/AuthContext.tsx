import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tokenManager, { AccessTokenPayload, AuthTokens } from '../utils/tokenManager';
import { router } from 'expo-router';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccessTokenPayload | null;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8080';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AccessTokenPayload | null>(null);

  // 앱 시작 시 로그인 상태 확인 (자동 로그인)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 로그인 상태 체크
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // 저장된 토큰 확인
      const tokens = await tokenManager.getTokens();
      if (!tokens) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Access Token 유효성 검사
      const isAccessValid = await tokenManager.isAccessTokenValid();
      
      if (isAccessValid) {
        // 유효한 경우 사용자 정보 설정
        const userInfo = await tokenManager.getUserInfo();
        setUser(userInfo);
        setIsAuthenticated(true);
        console.log('✅ 자동 로그인 성공:', userInfo?.userName);
      } else {
        // Access Token 만료 시 Refresh 시도
        const refreshSuccess = await refreshTokens();
        if (!refreshSuccess) {
          // Refresh도 실패하면 로그아웃
          await logout();
        }
      }
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리
  const login = async (tokens: AuthTokens) => {
    try {
      // 토큰 저장
      await tokenManager.saveTokens(tokens);
      
      // 사용자 정보 추출
      const userInfo = tokenManager.decodeAccessToken(tokens.accessToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      console.log('✅ 로그인 처리 완료:', userInfo?.userName);
    } catch (error) {
      console.error('❌ 로그인 처리 실패:', error);
      throw error;
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      // 토큰 삭제
      await tokenManager.clearTokens();
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      
      // 로그인 페이지로 이동
      router.replace('/');
      
      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  // 토큰 갱신
  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ Refresh Token 없음');
        return false;
      }

      // Refresh Token 유효성 확인
      const isRefreshValid = await tokenManager.isRefreshTokenValid();
      if (!isRefreshValid) {
        console.log('❌ Refresh Token 만료');
        return false;
      }

      // 백엔드에 토큰 갱신 요청
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      if (!response.ok) {
        console.log('❌ 토큰 갱신 실패:', response.status);
        return false;
      }

      const newTokens: AuthTokens = await response.json();
      
      // 새 토큰 저장
      await tokenManager.saveTokens(newTokens);
      
      // 사용자 정보 업데이트
      const userInfo = tokenManager.decodeAccessToken(newTokens.accessToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      console.log('✅ 토큰 갱신 성공');
      return true;
    } catch (error) {
      console.error('❌ 토큰 갱신 에러:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        refreshTokens,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};