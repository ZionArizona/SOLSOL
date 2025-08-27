// JWT 토큰 디코딩 함수
export const decodeToken = (token) => {
  if (!token) return null
  
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

// 관리자 권한 확인
export const isAdmin = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return false
  
  const decoded = decodeToken(token)
  if (!decoded) return false
  
  return decoded.role === 'ADMIN' || decoded.role === 'STAFF'
}

// 로그아웃 함수
export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// 관리자 권한 체크 및 리다이렉트
export const checkAdminAuth = () => {
  if (!isAdmin()) {
    alert('관리자 권한이 필요합니다.')
    logout()
    return false
  }
  return true
}