import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './signup.css'

export default function SignupPage(){
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    password: '',
    userNm: '',
    univNm: '',
    agreed: false
  })
  const [universities, setUniversities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/universities')
      if (response.ok) {
        const universities = await response.json()
        setUniversities(universities)
      } else {
        console.error('Failed to fetch universities:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.agreed) {
      alert('이용약관에 동의해주세요.')
      return
    }

    setIsLoading(true)
    
    try {
      // ADMIN 페이지에서는 모든 회원가입이 관리자로 처리
      const requestData = {
        userName: formData.userName,
        userId: formData.userId,
        password: formData.password,
        univNm: parseInt(formData.univNm),
        userNm: formData.userNm,
        role: 'ADMIN',
        accountCreationConsent: false
      }

      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('관리자 회원가입이 완료되었습니다!')
        navigate('/login')
      } else {
        alert('회원가입에 실패했습니다: ' + (result.message || '알 수 없는 오류'))
      }
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다')
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar/>
      <main className="signup-wrap">
        <div className="signup-inner">
          <h1 className="title">회원가입</h1>

          <div className="meta-row">
            <div className="info-label">INFORMATION</div>
            <div className="required-note">• 필수입력사항</div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="이름 *" 
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              required
            />
            <input 
              type="email" 
              placeholder="사용자 ID (이메일) *" 
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="비밀번호 *" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <input 
              type="text" 
              placeholder="교직원 번호 *" 
              value={formData.userNm}
              onChange={(e) => setFormData({...formData, userNm: e.target.value})}
              required
            />
            <select 
              value={formData.univNm}
              onChange={(e) => setFormData({...formData, univNm: e.target.value})}
              required
            >
              <option value="" disabled>학교 선택하기 *</option>
              {universities.map(univ => (
                <option key={univ.univNm} value={univ.univNm}>
                  {univ.univName}
                </option>
              ))}
            </select>
            <label className="agree">
              <input 
                type="checkbox" 
                checked={formData.agreed}
                onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
              />
              <span>이용약관 및 개인정보 수집, 이용에 모두 동의합니다.</span>
            </label>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
