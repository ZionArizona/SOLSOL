import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Sidebar({ isCollapsed, onToggle }){
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  
  const isActive = (path) => location.pathname === path

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* 모바일에서 사이드바가 열려있을 때 오버레이 */}
      {isMobile && !isCollapsed && (
        <div 
          className="sidebar-overlay" 
          onClick={onToggle}
        />
      )}
      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* 토글 버튼 */}
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle-btn"
            onClick={onToggle}
            aria-label={isCollapsed ? '사이드바 열기' : '사이드바 닫기'}
          >
            <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>
              {isCollapsed ? '>' : '<'}
            </span>
          </button>
          
          {!isCollapsed && (
            <div className="side-title">서류 관리 시스템</div>
          )}
        </div>

        <div className="side-group">
          <Link to="/scholarships" style={{textDecoration: 'none'}}>
            <div 
              className={`side-item ${isActive('/scholarships') ? 'active' : ''}`}
              title={isCollapsed ? '장학금 등록 관리' : ''}
            >
              <span className="side-icon">📋</span>
              {!isCollapsed && <span className="side-text">장학금 등록 관리</span>}
            </div>
          </Link>
          
          <Link to="/submissions" style={{textDecoration: 'none'}}>
            <div 
              className={`side-item ${isActive('/submissions') ? 'active' : ''}`}
              title={isCollapsed ? '장학금 신청 승인' : ''}
            >
              <span className="side-icon">✅</span>
              {!isCollapsed && <span className="side-text">장학금 신청 승인</span>}
            </div>
          </Link>
          
          <Link to="/document-approval" style={{textDecoration: 'none'}}>
            <div 
              className={`side-item ${isActive('/document-approval') ? 'active' : ''}`}
              title={isCollapsed ? '마일리지 지급' : ''}
            >
              <span className="side-icon">💰</span>
              {!isCollapsed && <span className="side-text">마일리지 지급</span>}
            </div>
          </Link>
          
          <Link to="/exchange" style={{textDecoration: 'none'}}>
            <div 
              className={`side-item ${isActive('/exchange') ? 'active' : ''}`}
              title={isCollapsed ? '마일리지 환전 관리' : ''}
            >
              <span className="side-icon">🔄</span>
              {!isCollapsed && <span className="side-text">마일리지 환전 관리</span>}
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
