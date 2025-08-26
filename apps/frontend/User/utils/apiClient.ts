import tokenManager from './tokenManager';

const API_BASE = 'http://localhost:8080';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean; // 인증 헤더 스킵 옵션
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // API 요청 래퍼
  async request(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    // 기본 헤더 설정
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // 인증이 필요한 요청인 경우 토큰 추가
    if (!skipAuth) {
      const accessToken = await tokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    // 요청 실행
    let response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // 401 에러 처리 (토큰 만료)
    if (response.status === 401 && !skipAuth) {
      console.log('⚠️ 401 에러 - 토큰 갱신 시도');
      
      // 토큰 갱신 시도
      const refreshSuccess = await this.handleTokenRefresh();
      
      if (refreshSuccess) {
        // 새 토큰으로 재시도
        const newAccessToken = await tokenManager.getAccessToken();
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
        }
      }
    }

    return response;
  }

  // 토큰 갱신 처리 (중복 방지)
  private async handleTokenRefresh(): Promise<boolean> {
    // 이미 갱신 중이면 기다림
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokens();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // 토큰 갱신 로직
  private async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ Refresh Token 없음');
        return false;
      }

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

      const newTokens = await response.json();
      await tokenManager.saveTokens(newTokens);
      
      console.log('✅ 토큰 자동 갱신 성공');
      return true;
    } catch (error) {
      console.error('❌ 토큰 갱신 에러:', error);
      return false;
    }
  }

  // GET 요청
  async get(endpoint: string, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  // POST 요청
  async post(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT 요청
  async put(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE 요청
  async delete(endpoint: string, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // PATCH 요청
  async patch(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export default new ApiClient();