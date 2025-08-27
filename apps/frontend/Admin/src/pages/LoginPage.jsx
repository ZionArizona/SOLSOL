import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './login.css'

export default function LoginPage(){
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // JWT 토큰을 헤더에서도 확인
        const authHeader = response.headers.get('Authorization')
        const tokenFromHeader = authHeader ? authHeader.replace('Bearer ', '') : result.data.accessToken
        
        localStorage.setItem('accessToken', tokenFromHeader || result.data.accessToken)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        localStorage.setItem('user', JSON.stringify({
          userId: formData.userId,
          userName: result.data.userName || formData.userId
        }))
        navigate('/')
      } else {
        alert('로그인에 실패했습니다: ' + (result.message || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar/>
      <main className="login-wrap">
        <div className="login-container">
          {/* 왼쪽 블랙 카피 영역 */}
          <section className="pitch">
            <h1>
              <span>Hey Calendar와</span><br/>
              <span>장학금을</span><br/>
              <span>더 간편하고,</span><br/>
              <span>편리하게</span>
            </h1>
          </section>

          {/* 오른쪽 글래스 로그인 카드 */}
          <section className="login-card">
            <form className="form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="사용자 ID를 입력해주세요" 
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                required
              />
              <input 
                type="password" 
                placeholder="비밀번호를 입력해주세요"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </button>

              <div className="meta">
                <label className="auto">
                  <input type="checkbox" />
                  <span>자동로그인</span>
                </label>
                <div className="links">
                  <span style={{color:'#7d7d7d'}}>아직 회원이 아니신가요?</span>
                  <a href="/signup" className="signup">회원가입</a>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  )
}
