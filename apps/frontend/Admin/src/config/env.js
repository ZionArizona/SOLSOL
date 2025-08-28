// 환경별 API 설정
const getApiBaseUrl = () => {
  // 개발 환경에서는 localhost 사용
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api'
  }
  
  // 배포 환경에서는 환경변수나 배포 도메인 사용
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'
}

const MODE = import.meta.env.MODE;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (MODE === 'development' ? 'http://localhost:8080/api' : '/api');

export { API_BASE_URL };

//export const API_BASE_URL = getApiBaseUrl()

// 기타 환경 설정들
export const ENV = {
    MODE,
  API_BASE_URL,
  // 향후 다른 설정들 추가 가능
}