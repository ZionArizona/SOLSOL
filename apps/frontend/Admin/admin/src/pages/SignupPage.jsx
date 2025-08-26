import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './signup.css'

export default function SignupPage(){
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    userKey: '',
    grade: 1,
    gpa: 0.0,
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
      const result = await response.json()
      if (result.success) {
        setUniversities(result.data)
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
      alert('회원가입 기능은 현재 백엔드 API가 준비되지 않았습니다. 관리자에게 문의해주세요.')
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
              type="text" 
              placeholder="사용자 ID *" 
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="비밀번호 *" 
              value={formData.userKey}
              onChange={(e) => setFormData({...formData, userKey: e.target.value})}
              required
            />
            <div className="row">
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
              <button type="button" className="btn-outline">관리자 인증</button>
            </div>
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
