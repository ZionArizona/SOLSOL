import { Link, useLocation } from 'react-router-dom'

export default function Sidebar(){
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <div className="side-title">서류 관리 시스템</div>

      <div className="side-group">
        <Link to="/admin/submissions" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/admin/submissions') ? 'active' : ''}`}>
            <span className="side-dot"/> 제출 서류 관리
          </div>
        </Link>
        <Link to="/admin/applicants" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/admin/applicants') ? 'active' : ''}`}>
            <span className="side-dot"/> 신청자 관리
          </div>
        </Link>
        <Link to="/admin/scholarships" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/admin/scholarships') ? 'active' : ''}`}>
            <span className="side-dot"/> 장학금 관리
          </div>
        </Link>
        <Link to="/admin/announcements" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/admin/announcements') ? 'active' : ''}`}>
            <span className="side-dot"/> 공지글
          </div>
        </Link>
        <Link to="/admin/settings" style={{textDecoration: 'none'}}>
          <div className={`side-item ${isActive('/admin/settings') ? 'active' : ''}`}>
            <span className="side-dot"/> 설정
          </div>
        </Link>
      </div>
    </aside>
  )
}
