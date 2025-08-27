import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminAuth } from '../utils/auth'

export default function AdminRoute({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = () => {
      if (!checkAdminAuth()) {
        navigate('/login')
        return
      }
    }

    // 페이지 로드 시 권한 체크
    checkAuth()

    // 주기적으로 토큰 유효성 체크 (5분마다)
    const interval = setInterval(checkAuth, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [navigate])

  return <>{children}</>
}