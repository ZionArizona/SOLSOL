import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../utils/api'
import './submission.css'

export default function DocumentApproval(){
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [mileageInput, setMileageInput] = useState('')
  const [stats, setStats] = useState([
    { label: '제출된 서류', value: 0 },
    { label: '승인 대기', value: 0 },
    { label: '승인 완료', value: 0 },
    { label: '반려', value: 0 },
  ])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      // 실제 API에서는 제출된 서류 목록을 가져와야 합니다
      // 현재는 applications API를 사용하여 서류 정보를 가져오겠습니다
      const result = await api.get('/applications')
      if (result.success) {
        // 서류가 있는 applications만 필터링
        const documentsData = result.data ? result.data.filter(app => app.documents && app.documents.length > 0) : []
        setDocuments(documentsData)
        calculateStats(documentsData)
      } else {
        // API 성공했지만 데이터가 없는 경우
        setDocuments([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      // 데이터가 없는 경우와 실제 에러를 구분
      if (error.message?.includes('500') || error.message?.includes('서버 내부 오류')) {
        // 서버 에러인 경우 빈 배열로 처리 (아무것도 없는 경우)
        setDocuments([])
        calculateStats([])
        console.log('No documents available yet')
      } else {
        alert('서류 목록을 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.reduce((sum, app) => sum + (app.documents ? app.documents.length : 0), 0)
    const pending = data.filter(app => app.applicationState === 'PENDING' || app.state === 'PENDING').length
    const approved = data.filter(app => app.applicationState === 'APPROVED' || app.state === 'APPROVED').length
    const rejected = data.filter(app => app.applicationState === 'REJECTED' || app.state === 'REJECTED').length

    setStats([
      { label: '제출된 서류', value: total },
      { label: '승인 대기', value: pending },
      { label: '승인 완료', value: approved },
      { label: '반려', value: rejected },
    ])
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.scholarshipName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && (doc.applicationState === 'PENDING' || doc.state === 'PENDING')) ||
      (activeTab === 'approved' && (doc.applicationState === 'APPROVED' || doc.state === 'APPROVED')) ||
      (activeTab === 'rejected' && (doc.applicationState === 'REJECTED' || doc.state === 'REJECTED'))
    
    return matchesSearch && matchesTab
  })

  const tabs = [
    { key:'all', label:`전체 (${documents.length})`, active: activeTab === 'all' },
    { key:'pending', label:`승인 대기 (${stats[1].value})`, active: activeTab === 'pending' },
    { key:'approved', label:`승인 완료 (${stats[2].value})`, active: activeTab === 'approved' },
    { key:'rejected', label:`반려 (${stats[3].value})`, active: activeTab === 'rejected' },
  ]

  const handleSearch = () => {
    // 검색 로직은 이미 filteredDocuments에서 처리됨
  }

  const handleViewDetails = async (document) => {
    try {
      const result = await api.get(`/applications/${document.userNm}/${document.scholarshipNm}`)
      setSelectedDocument(result)
      setShowDetailModal(true)
      setMileageInput('')
    } catch (error) {
      console.error('Failed to fetch document details:', error)
      alert('상세 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleApproveDocument = async () => {
    if (!selectedDocument || !mileageInput) {
      alert('마일리지를 입력해주세요.')
      return
    }

    const mileage = parseInt(mileageInput)
    if (isNaN(mileage) || mileage < 0) {
      alert('올바른 마일리지 값을 입력해주세요.')
      return
    }

    try {
      // 서류 승인 및 마일리지 지급 API 호출
      const response = await api.post('/applications/documents/approve', {
        userNm: selectedDocument.userNm,
        scholarshipNm: selectedDocument.scholarshipNm,
        mileage: mileage
      })
      
      if (response.success) {
        alert(`서류가 승인되었으며 ${mileage} 마일리지가 지급되었습니다.`)
        setShowDetailModal(false)
        fetchDocuments()
      } else {
        alert(response.message || '서류 승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to approve document:', error)
      alert('서류 승인에 실패했습니다.')
    }
  }

  const handleRejectDocument = async () => {
    if (!selectedDocument) return

    if (confirm('정말로 이 서류를 반려하시겠습니까?')) {
      try {
        const response = await api.post('/applications/documents/reject', {
          userNm: selectedDocument.userNm,
          scholarshipNm: selectedDocument.scholarshipNm
        })
        
        if (response.success) {
          alert('서류가 반려되었습니다.')
          setShowDetailModal(false)
          fetchDocuments()
        } else {
          alert(response.message || '서류 반려에 실패했습니다.')
        }
      } catch (error) {
        console.error('Failed to reject document:', error)
        alert('서류 반려에 실패했습니다.')
      }
    }
  }

  const handleViewFile = async (doc) => {
    try {
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank')
      } else {
        alert('파일을 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to view file:', error)
      alert('파일 보기 중 오류가 발생했습니다.')
    }
  }

  const handleDownloadFile = async (doc) => {
    try {
      if (doc.fileUrl) {
        const link = document.createElement('a')
        link.href = doc.fileUrl
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

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar/>
          <main className="admin-main">
            <div style={{textAlign: 'center', padding: '50px'}}>
              <div>로딩 중...</div>
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
        <Sidebar/>
        <main className="admin-main">
          {/* 검색바 */}
          <div className="topbar">
            <input
              type="text"
              className="search"
              placeholder="사용자명 또는 장학금명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={handleSearch}>검색</button>
          </div>

          {/* 통계 카드 */}
          <div className="stat-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="stat">
                <div className="v">{stat.value.toLocaleString()}</div>
                <div className="l">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 탭 */}
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab.key}
                className={`tab ${tab.active ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* 테이블 */}
          <div className="table">
            <div className="thead">
              <div>사용자</div>
              <div>제출 서류</div>
              <div>장학금</div>
              <div>제출 시간</div>
              <div>액션</div>
            </div>
            
            {filteredDocuments.map((doc, index) => (
              <div key={`${doc.userNm}-${doc.scholarshipNm}-${index}`} className="trow">
                <div className="cell-title">
                  <div className="icon">👤</div>
                  <div>
                    <div className="title">{doc.userName || doc.userNm}</div>
                    <div className="sub">{doc.studentId || '학번 정보 없음'}</div>
                  </div>
                </div>

                <div className="files">
                  {doc.documents?.slice(0, 3).map((document, idx) => (
                    <div key={idx} className="file">
                      <div className="dot"></div>
                      {document.originalFileName || `서류 ${idx + 1}`}
                    </div>
                  ))}
                  {doc.documents?.length > 3 && (
                    <div className="file">
                      <div className="dot"></div>
                      외 {doc.documents.length - 3}개
                    </div>
                  )}
                </div>

                <div className="cell-app">{doc.scholarshipName}</div>
                <div className="cell-time">
                  {doc.appliedAt ? new Date(doc.appliedAt).toLocaleDateString('ko-KR') : '정보 없음'}
                </div>

                <div className="act">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(doc)}
                  >
                    상세보기
                  </button>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                조건에 맞는 서류가 없습니다.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>서류 승인 및 마일리지 지급</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>신청자 정보</h4>
                <p><strong>이름:</strong> {selectedDocument.userName || selectedDocument.userNm}</p>
                <p><strong>학번:</strong> {selectedDocument.studentId || '정보 없음'}</p>
                <p><strong>장학금:</strong> {selectedDocument.scholarshipName}</p>
                <p><strong>신청일:</strong> {selectedDocument.appliedAt ? new Date(selectedDocument.appliedAt).toLocaleDateString('ko-KR') : '정보 없음'}</p>
                <p>
                  <strong>상태:</strong>
                  <span className={`status-badge ${
                    selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? 'approved' :
                    selectedDocument.state === 'REJECTED' || selectedDocument.applicationState === 'REJECTED' ? 'rejected' : 'pending'
                  }`}>
                    {selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? '승인' :
                     selectedDocument.state === 'REJECTED' || selectedDocument.applicationState === 'REJECTED' ? '반려' : '대기'}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h4>제출 서류</h4>
                <div className="documents-list">
                  {selectedDocument.documents?.map((doc, index) => (
                    <div key={index} className="document-item">
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <div>{doc.originalFileName || `서류 ${index + 1}`}</div>
                        <div className="doc-details">{doc.contentType || 'application/pdf'}</div>
                        <div className="doc-date">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR') : '업로드 일시 정보 없음'}
                        </div>
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

              <div className="detail-section">
                <h4>마일리지 지급</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <input
                    type="number"
                    placeholder={selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? "마일리지 지급 완료" : "지급할 마일리지 입력"}
                    value={mileageInput}
                    onChange={(e) => setMileageInput(e.target.value)}
                    disabled={selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED'}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      flex: 1,
                      fontSize: '14px',
                      backgroundColor: selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? '#f9fafb' : 'white',
                      cursor: selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? 'not-allowed' : 'text'
                    }}
                    min="0"
                  />
                  <span style={{color: '#6b7280', fontSize: '14px'}}>마일리지</span>
                </div>
                <p style={{fontSize: '12px', color: '#6b7280'}}>
                  {selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' 
                    ? "* 이 서류는 이미 승인되어 마일리지 지급이 완료되었습니다."
                    : "* 서류 승인 시 입력한 마일리지가 사용자에게 지급됩니다."
                  }
                </p>
              </div>
            </div>
            <div className="modal-footer">
              {selectedDocument.state === 'APPROVED' || selectedDocument.applicationState === 'APPROVED' ? (
                <div style={{
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '6px',
                  color: '#0369a1',
                  fontWeight: '600'
                }}>
                  ✅ 이미 승인된 서류입니다. 마일리지 지급이 완료되었습니다.
                </div>
              ) : selectedDocument.state === 'REJECTED' || selectedDocument.applicationState === 'REJECTED' ? (
                <div style={{
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontWeight: '600'
                }}>
                  ❌ 반려된 서류입니다.
                </div>
              ) : (
                <>
                  <button 
                    className="reject-btn-modal" 
                    onClick={handleRejectDocument}
                  >
                    반려
                  </button>
                  <button 
                    className="approve-btn-modal" 
                    onClick={handleApproveDocument}
                  >
                    승인 및 마일리지 지급
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}