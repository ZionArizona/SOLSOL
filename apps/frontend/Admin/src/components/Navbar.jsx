import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '../assets/heyLogo.png'
import { API_BASE_URL } from '../config/env'

const navStyle={
  wrap:{
    position:'sticky',top:0,zIndex:10,background:'rgba(255,255,255,.85)',
    backdropFilter:'saturate(1.2) blur(8px)', borderBottom:'1px solid rgba(0,0,0,.06)'
  },
  inner:{display:'flex',alignItems:'center',justifyContent:'space-between',height:'72px'}
}

export default function Navbar(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    setUser(null)
    navigate('/login')
  }

  return (
    <div style={navStyle.wrap}>
      <div className="container" style={navStyle.inner}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link to="/">
            <img src={logo} alt="HEY CALENDAR" height="60"/>
          </Link>
        </div>
        <nav style={{display:'flex',gap:'28px',fontWeight:600,color:'#4b5563',alignItems:'center'}}>
          {user ? (
            <>
              <Link to="/scholarships" style={{textDecoration:'none',color:'#4b5563'}}>장학금 등록</Link>
              <Link to="/submissions" style={{textDecoration:'none',color:'#4b5563'}}>신청 관리</Link>
              <Link to="/document-approval" style={{textDecoration:'none',color:'#4b5563'}}>서류 검토</Link>
              {/* <Link to="/notices" style={{textDecoration:'none',color:'#4b5563'}}>공지사항</Link> */}
              <span style={{color:'#666'}}>{user.userNm || user.userName}님</span>
              <button 
                onClick={handleLogout}
                style={{
                  background:'none', 
                  border:'none', 
                  color:'#4b5563',
                  fontWeight:600,
                  cursor:'pointer',
                  textDecoration:'underline'
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{textDecoration:'none',color:'#4b5563'}}>로그인</Link>
              <Link to="/signup" style={{textDecoration:'none',color:'#4b5563'}}>회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
