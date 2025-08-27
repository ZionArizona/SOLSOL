import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

// 토큰 저장 키
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// JWT 페이로드 타입 정의
export interface AccessTokenPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  typ: string;
  userId: string;
  userName: string;
  role: string;
  grade: number;
  univName: string;
  collegeName: string;
  deptName: string;
}

export interface RefreshTokenPayload {
  iss: string;
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  typ: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class TokenManager {
  // 토큰 저장 (SecureStore 사용 - iOS: Keychain, Android: SharedPreferences 암호화)
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      console.log('✅ 토큰 저장 완료');
    } catch (error) {
      console.error('❌ 토큰 저장 실패:', error);
      throw error;
    }
  }

  // Access Token 가져오기
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Access Token 조회 실패:', error);
      return null;
    }
  }

  // Refresh Token 가져오기
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Refresh Token 조회 실패:', error);
      return null;
    }
  }

  // 모든 토큰 가져오기
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      
      if (!accessToken || !refreshToken) {
        return null;
      }
      
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('❌ 토큰 조회 실패:', error);
      return null;
    }
  }

  // 토큰 삭제 (로그아웃)
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      console.log('✅ 토큰 삭제 완료');
    } catch (error) {
      console.error('❌ 토큰 삭제 실패:', error);
    }
  }

  // Access Token 디코드
  decodeAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwtDecode<AccessTokenPayload>(token);
    } catch (error) {
      console.error('❌ Access Token 디코드 실패:', error);
      return null;
    }
  }

  // Refresh Token 디코드
  decodeRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwtDecode<RefreshTokenPayload>(token);
    } catch (error) {
      console.error('❌ Refresh Token 디코드 실패:', error);
      return null;
    }
  }

  // 토큰 만료 확인 (exp는 초 단위 Unix timestamp)
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000; // 현재 시간을 초 단위로
      
      // 30초 여유를 두고 만료 체크 (네트워크 지연 고려)
      return decoded.exp < currentTime + 30;
    } catch (error) {
      console.error('❌ 토큰 만료 체크 실패:', error);
      return true; // 에러 시 만료된 것으로 간주
    }
  }

  // Access Token이 유효한지 확인
  async isAccessTokenValid(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Refresh Token이 유효한지 확인
  async isRefreshTokenValid(): Promise<boolean> {
    const token = await this.getRefreshToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // 사용자 정보 가져오기 (Access Token에서 추출)
  async getUserInfo(): Promise<AccessTokenPayload | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return this.decodeAccessToken(token);
  }

  // 디버깅용: SecureStore에 저장된 모든 토큰 값들 출력
  async debugPrintAllTokens(): Promise<void> {
    try {
      console.log('🔍 === SecureStore 저장된 값들 확인 ===');
      
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      
      console.log('🔑 Access Token 존재:', accessToken ? 'YES' : 'NO');
      if (accessToken) {
        console.log('📄 Access Token (앞 50자):', accessToken.substring(0, 50) + '...');
        
        // Access Token 디코딩해서 내용 확인
        const payload = this.decodeAccessToken(accessToken);
        if (payload) {
          console.log('👤 사용자 정보 (전체):', {
            iss: payload.iss,
            sub: payload.sub,
            iat: payload.iat,
            exp: payload.exp,
            typ: payload.typ,
            userId: payload.userId,
            userName: payload.userName,
            role: payload.role,
            grade: payload.grade,
            univName: payload.univName,
            collegeName: payload.collegeName,
            deptName: payload.deptName,
            발급시간: new Date(payload.iat * 1000).toLocaleString(),
            만료시간: new Date(payload.exp * 1000).toLocaleString()
          });
        }
      }
      
      console.log('🔄 Refresh Token 존재:', refreshToken ? 'YES' : 'NO');
      if (refreshToken) {
        console.log('📄 Refresh Token (앞 50자):', refreshToken.substring(0, 50) + '...');
        
        // Refresh Token 디코딩해서 만료시간 확인
        const refreshPayload = this.decodeRefreshToken(refreshToken);
        if (refreshPayload) {
          console.log('⏰ Refresh Token 만료시간:', new Date(refreshPayload.exp * 1000).toLocaleString());
        }
      }
      
      console.log('🔍 === SecureStore 확인 완료 ===');
    } catch (error) {
      console.error('❌ SecureStore 확인 실패:', error);
    }
  }
}

export default new TokenManager();