// utils/auth/logout.ts
import { Platform } from 'react-native';
import TokenManager from './tokenManager';

// axios를 쓰는 경우만 주석 해제
// import axios from 'axios';
import { BASE_URL } from '../services/api'; // 있다면 사용

/**
 * 로컬(웹/네이티브) 저장소에서 토큰 제거 및 메모리 상태 초기화.
 * 필요시 백엔드 리프레시 토큰 무효화 API를 여기에 추가하세요.
 */
export async function logoutCore(): Promise<void> {
  console.log('🚪 로그아웃 시작');

  console.log('🔎 [BEFORE] 저장된 토큰');
  await TokenManager.debugPrintAllTokens();

  //백엔드 로그아웃 호출 
  try {
    const rt = await TokenManager.getRefreshToken();
    if (rt) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
    }
  } catch (e) {
    console.warn('⚠️ 서버 로그아웃 호출 실패(무시 가능):', e);
  } finally {
    // 1) 저장소 토큰 제거
    await TokenManager.clearTokens();

    // 2) 전역 Authorization 헤더 초기화(axios 사용 시)
    // delete axios.defaults.headers.common['Authorization'];

    // (선택) 웹 전용 추가 정리
    if (Platform.OS === 'web') {
        // sessionStorage 등의 별도 캐시를 쓴다면 여기서 정리
        // sessionStorage.removeItem('...'); // 필요한 항목만 제거 권장
    }

    console.log('🔎 [AFTER] 저장된 토큰');
    await TokenManager.debugPrintAllTokens();

    console.log('✅ 로그아웃 로컬 정리 완료');
  }

}
