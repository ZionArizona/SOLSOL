import { API_BASE_URL } from '../config/env'

// 진행 중인 요청들을 추적하는 Map
const pendingRequests = new Map()

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const apiCall = async (endpoint, options = {}) => {
  const requestKey = `${options.method || 'GET'}:${endpoint}`
  
  // 이미 같은 요청이 진행 중인지 확인
  if (pendingRequests.has(requestKey)) {
    console.log(`Duplicate request blocked: ${requestKey}`)
    return pendingRequests.get(requestKey)
  }
  
  try {
    const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    }).then(async response => {
      const result = await response.json()
      
      if (!response.ok) {
        // 500 에러인 경우 더 구체적인 메시지 제공
        if (response.status === 500) {
          throw new Error('서버 내부 오류가 발생했습니다.')
        }
        throw new Error(result.message || 'API call failed')
      }
      
      return result
    })
    
    // 요청을 Map에 저장
    pendingRequests.set(requestKey, requestPromise)
    
    const result = await requestPromise
    return result
  } catch (error) {
    console.error('API Error:', error)
    throw error
  } finally {
    // 요청 완료 후 Map에서 제거
    pendingRequests.delete(requestKey)
  }
}

export const api = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' })
}