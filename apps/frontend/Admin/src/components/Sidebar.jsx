import { Link, useLocation } from 'react-router-dom'

export default function Sidebar(){
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <div className="side-title">서류 관리 시스템</div>

      <div className="side-group">
        <Link to="/scholarships" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/scholarships') ? 'active' : ''}`}>
            <span className="side-dot"/> 장학금 등록 관리
          </div>
        </Link>
        <Link to="/submissions" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/submissions') ? 'active' : ''}`}>
            <span className="side-dot"/> 장학금 신청 승인
          </div>
        </Link>
        <Link to="/document-approval" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/document-approval') ? 'active' : ''}`}>
            <span className="side-dot"/> 마일리지 지급
          </div>
        </Link>
        <Link to="/exchange" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/exchange') ? 'active' : ''}`}>
            <span className="side-dot"/> 마일리지 환전 관리
          </div>
        </Link>
      </div>
    </aside>
  )
}
