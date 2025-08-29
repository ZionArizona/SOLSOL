import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import FilterTabs from '../components/FilterTabs'
import DocTable from '../components/DocTable'
import { api } from '../utils/api'
import './submission.css'

export default function SubmissionManage(){
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [scholarshipFilter, setScholarshipFilter] = useState('all') // 장학금 필터
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // 사이드바 상태
  const [showRejectModal, setShowRejectModal] = useState(false) // 반려 모달 상태
  const [rejectReason, setRejectReason] = useState('') // 반려 사유
  const [pendingRejection, setPendingRejection] = useState(null) // 반려 대기 신청서
  const [stats, setStats] = useState([
    { label: '등록 서류', value: 0 },
    { label: '검토 대기', value: 0 },
    { label: '승인 완료', value: 0 },
    { label: '반려', value: 0 },
  ])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const result = await api.get('/applications')
      console.log('신청서 목록 응답:', result)
      
      if (result.success) {
        console.log('신청서 데이터 샘플:', result.data[0])
        setApplications(result.data)
        calculateStats(result.data)
        const applicationsData = result.data || []
        setApplications(applicationsData)
        calculateStats(applicationsData)
      } else {
        // API 성공했지만 데이터가 없는 경우
        setApplications([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      // 데이터가 없는 경우와 실제 에러를 구분
      if (error.message?.includes('500') || error.message?.includes('서버 내부 오류')) {
        // 서버 에러인 경우 빈 배열로 처리 (아무것도 없는 경우)
        setApplications([])
        calculateStats([])
        console.log('No applications available yet')
      } else {
        alert('신청서 목록을 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.length
    const pending = data.filter(app => app.applicationState === 'PENDING' || app.state === 'PENDING').length
    const approved = data.filter(app => app.applicationState === 'APPROVED' || app.state === 'APPROVED').length
    const rejected = data.filter(app => app.applicationState === 'REJECTED' || app.state === 'REJECTED').length

    setStats([
      { label: '등록 서류', value: total },
      { label: '검토 대기', value: pending },
      { label: '승인 완료', value: approved },
      { label: '반려', value: rejected },
    ])
  }

  const handleApproval = async (userNm, scholarshipNm, action, reason = null) => {
    try {
      if (action === 'approve') {
        await api.put(`/applications/${userNm}/${scholarshipNm}/approve`, {
          reason: '승인되었습니다.',
          reviewedBy: 'admin'
        })
      } else {
        await api.put(`/applications/${userNm}/${scholarshipNm}/reject`, {
          reason: reason || '검토 결과 반려되었습니다.',
          reviewedBy: 'admin'
        })
      }
      
      alert(`신청서가 ${action === 'approve' ? '승인' : '반려'}되었습니다.`)
      fetchApplications()
    } catch (error) {
      console.error(`Failed to ${action} application:`, error)
      alert(`신청서 ${action === 'approve' ? '승인' : '반려'}에 실패했습니다.`)
    }
  }

  const handleRejectClick = (userNm, scholarshipNm) => {
    setPendingRejection({ userNm, scholarshipNm })
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!pendingRejection) return
    
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.')
      return
    }

    await handleApproval(pendingRejection.userNm, pendingRejection.scholarshipNm, 'reject', rejectReason)
    
    setShowRejectModal(false)
    setPendingRejection(null)
    setRejectReason('')
  }

  const handleViewFile = async (doc) => {
    try {
      // 암호화된 장학금 신청 서류의 경우 presigned URL 생성
      console.log('🔍 파일 보기 요청:', doc)
      
      const userNm = selectedApplication?.userNm
      const scholarshipNm = selectedApplication?.scholarshipNm
      const documentNm = doc.applicationDocumentNm
      
      if (!userNm || !scholarshipNm || !documentNm) {
        alert('파일 정보가 부족합니다.')
        return
      }

      const response = await api.get(`/applications/admin/documents/download-url?userNm=${userNm}&scholarshipNm=${scholarshipNm}&documentNm=${documentNm}`)
      
      if (response.success && response.data) {
        window.open(response.data, '_blank')
      } else {
        alert('파일 URL을 생성할 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to view file:', error)
      alert('파일 보기 중 오류가 발생했습니다.')
    }
  }

  const handleDownloadFile = async (doc) => {
    try {
      // 암호화된 장학금 신청 서류의 경우 presigned URL 생성
      console.log('📥 파일 다운로드 요청:', doc)
      
      const userNm = selectedApplication?.userNm
      const scholarshipNm = selectedApplication?.scholarshipNm
      const documentNm = doc.applicationDocumentNm
      
      if (!userNm || !scholarshipNm || !documentNm) {
        alert('파일 정보가 부족합니다.')
        return
      }

      const response = await api.get(`/applications/admin/documents/download-url?userNm=${userNm}&scholarshipNm=${scholarshipNm}&documentNm=${documentNm}`)
      
      if (response.success && response.data) {
        // 파일 다운로드
        const link = document.createElement('a')
        link.href = response.data
        link.download = doc.originalFileName || `document_${doc.applicationDocumentNm}`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('파일을 다운로드할 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to download file:', error)
      alert('파일 다운로드 중 오류가 발생했습니다.')
    }
  }

  const transformApplicationData = (application) => ({
    id: `${application.userNm}-${application.scholarshipNm}`,
    scholarship: application.scholarshipName || '장학금명 없음',
    unit: application.departmentName ? `${application.departmentName} - ${application.collegeName || ''}` : '전체 학과',
    files: application.documents?.map(doc => doc.originalFileName || doc.documentName || doc.applicationDocumentNm) || [],
    applicant: application.userName || '신청자명 없음',
    studentId: `${application.userNm} - ${application.departmentName || '학과 정보없음'}`,
    time: new Date(application.applicationDate || application.appliedAt).toLocaleString('ko-KR') || '-',
    status: application.applicationState === 'PENDING' || application.state === 'PENDING' ? '검토 대기' :
             application.applicationState === 'APPROVED' || application.state === 'APPROVED' ? '승인' : '반려',
    userNm: application.userNm,
    scholarshipNm: application.scholarshipNm,
    onApprove: () => handleApproval(application.userNm, application.scholarshipNm, 'approve'),
    onReject: () => handleRejectClick(application.userNm, application.scholarshipNm)
  })

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.scholarshipName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 장학금 필터링
    const matchesScholarship = scholarshipFilter === 'all' || 
      app.scholarshipNm?.toString() === scholarshipFilter
    
    let matchesTab = true
    if (activeTab === 'pending') matchesTab = (app.applicationState === 'PENDING' || app.state === 'PENDING')
    else if (activeTab === 'approved') matchesTab = (app.applicationState === 'APPROVED' || app.state === 'APPROVED')
    else if (activeTab === 'rejected') matchesTab = (app.applicationState === 'REJECTED' || app.state === 'REJECTED')
    
    return matchesSearch && matchesScholarship && matchesTab
  })

  // 장학금 목록 생성 (필터링용) - 신청자 수와 함께 표시
  const scholarshipOptions = applications.reduce((acc, app) => {
    const key = app.scholarshipNm?.toString()
    if (key && !acc.some(item => item.value === key)) {
      // 해당 장학금의 신청자 수 계산
      const applicantCount = applications.filter(a => a.scholarshipNm?.toString() === key).length
      
      acc.push({
        value: key,
        label: `${app.scholarshipName} (${applicantCount}명)`,
        name: app.scholarshipName
      })
    }
    return acc
  }, []).sort((a, b) => a.label.localeCompare(b.label))

  const tabs = [
    { key:'all', label:`전체 (${applications.length})`, active: activeTab === 'all' },
    { key:'pending', label:`검토 대기 (${stats[1].value})`, active: activeTab === 'pending' },
    { key:'approved', label:`승인 (${stats[2].value})`, active: activeTab === 'approved' },
    { key:'rejected', label:`반려 (${stats[3].value})`, active: activeTab === 'rejected' },
  ]

  const handleSearch = () => {
    // 검색 로직은 이미 filteredApplications에서 처리됨
  }

  const handleViewDetails = async (application) => {
    try {
      const result = await api.get(`/applications/${application.userNm}/${application.scholarshipNm}`)
      console.log('상세보기 응답:', result)
      
      if (result.success && result.data) {
        setSelectedApplication(result.data)
      } else if (result.data) {
        setSelectedApplication(result.data)
      } else {
        setSelectedApplication(result)
      }
      setShowDetailModal(true)
    } catch (error) {
      console.error('Failed to fetch application details:', error)
      alert('상세 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar 
            isCollapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
          <main className="admin-main">
            <div style={{textAlign: 'center', padding: '50px'}}>
              로딩 중...
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main className="admin-main">
          {/* 상단 우측 검색 및 필터 */}
          <div className="topbar">
            <input 
              className="search" 
              placeholder="장학금명 또는 신청자명으로 검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={scholarshipFilter}
              onChange={(e) => setScholarshipFilter(e.target.value)}
              className="scholarship-filter"
              style={{
                padding: '8px 12px',
                marginLeft: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="all">모든 장학금</option>
              {scholarshipOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="search-btn" onClick={handleSearch}>검색</button>
          </div>

          {/* 요약 카드 */}
          <StatCards items={stats}/>

          {/* 탭 */}
          <FilterTabs 
            items={tabs}
            onTabChange={(tabKey) => setActiveTab(tabKey)}
          />

          {/* 테이블 */}
          <DocTable 
            rows={filteredApplications.map(transformApplicationData)}
            onViewDetails={handleViewDetails}
          />
        </main>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>신청서 상세 정보</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>장학금 정보</h4>
                <p><strong>장학금명:</strong> {selectedApplication.scholarshipName || '정보 없음'}</p>
                <p><strong>장학금 ID:</strong> {selectedApplication.scholarshipNm}</p>
              </div>
              
              <div className="detail-section">
                <h4>신청자 정보</h4>
                <p><strong>이름:</strong> {selectedApplication.userName || '정보 없음'}</p>
                <p><strong>학번:</strong> {selectedApplication.userNm}</p>
                <p><strong>학과:</strong> {selectedApplication.departmentName || '정보 없음'}</p>
                <p><strong>단과대:</strong> {selectedApplication.collegeName || '정보 없음'}</p>
                <p><strong>대학교:</strong> {selectedApplication.universityName || '정보 없음'}</p>
              </div>
              
              <div className="detail-section">
                <h4>신청 정보</h4>
                <p><strong>신청일시:</strong> {new Date(selectedApplication.appliedAt).toLocaleString('ko-KR')}</p>
                <p><strong>상태:</strong> 
                  <span className={`status-badge ${selectedApplication.state?.toLowerCase()}`}>
                    {selectedApplication.state === 'PENDING' ? '검토 대기' :
                     selectedApplication.state === 'APPROVED' ? '승인' : '반려'}
                  </span>
                </p>
                {selectedApplication.reason && (
                  <p><strong>사유/메모:</strong> {selectedApplication.reason}</p>
                )}
              </div>

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="detail-section">
                  <h4>제출 서류</h4>
                  <div className="documents-list">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <span className="doc-icon">📄</span>
                        <div className="doc-info">
                          <p><strong>{doc.originalFileName || doc.applicationDocumentNm}</strong></p>
                          <p className="doc-details">
                            {doc.formattedFileSize || '크기 정보 없음'} • {doc.contentType || '파일 타입 불명'}
                          </p>
                          <p className="doc-date">
                            업로드: {new Date(doc.uploadedAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div className="doc-actions">
                          <button 
                            className="btn-view" 
                            onClick={() => handleViewFile(doc)}
                            title="파일 보기"
                          >
                            👁️ 보기
                          </button>
                          <button 
                            className="btn-download" 
                            onClick={() => handleDownloadFile(doc)}
                            title="파일 다운로드"
                          >
                            💾 다운로드
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {selectedApplication.state === 'PENDING' && (
              <div className="modal-footer">
                <button 
                  className="approve-btn-modal"
                  onClick={() => {
                    handleApproval(selectedApplication.userNm, selectedApplication.scholarshipNm, 'approve')
                    setShowDetailModal(false)
                  }}
                >
                  승인
                </button>
                <button 
                  className="reject-btn-modal"
                  onClick={() => {
                    handleRejectClick(selectedApplication.userNm, selectedApplication.scholarshipNm)
                    setShowDetailModal(false)
                  }}
                >
                  반려
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 반려 사유 입력 모달 */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>반려 사유 입력</h3>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label htmlFor="rejectReason"><strong>반려 사유:</strong></label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="반려 사유를 입력해주세요. 이 메시지는 신청자에게 전달됩니다."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginTop: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '8px 16px',
                  marginRight: '8px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button 
                className="reject-btn-modal"
                onClick={handleRejectConfirm}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
