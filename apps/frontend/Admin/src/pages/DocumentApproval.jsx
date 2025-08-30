import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import FilterTabs from '../components/FilterTabs'
import DocTable from '../components/DocTable'
import { api } from '../utils/api'
import './submission.css'

export default function DocumentApproval(){
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [scholarshipFilter, setScholarshipFilter] = useState('all') // 장학금 필터
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [mileageInput, setMileageInput] = useState('')
  const [paymentStatus, setPaymentStatus] = useState({}) // 로컬 상태 (실제 데이터는 서버에서 관리)
  const [isProcessing, setIsProcessing] = useState(false) // 중복 요청 방지
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // 사이드바 상태
  const [stats, setStats] = useState([
    { label: '마일리지 지급 대기', value: 0 },
    { label: '마일리지 지급 완료', value: 0 },
    { label: '총 지급 예정 금액', value: 0 },
    { label: '총 지급 완료 금액', value: 0 },
  ])

  useEffect(() => {
    fetchDocuments()
  }, [])

  // paymentStatus가 변경될 때마다 통계 재계산
  useEffect(() => {
    calculateStats(documents)
  }, [paymentStatus, documents])

  const fetchDocuments = async (force = false) => {
    // 중복 요청 방지 (force가 true인 경우는 예외)
    if (isProcessing && !force) {
      console.log('🚫 Request blocked - already processing')
      return
    }
    
    try {
      setIsProcessing(true)
      console.log('🔍 Fetching documents for approval...')
      
      const result = await api.get('/applications')
      console.log('📊 Raw API result:', result)
      
      if (result.success) {
        const allApplications = result.data || []
        console.log('📋 All applications count:', allApplications.length)
        console.log('📋 All applications:', allApplications.map(app => ({
          userNm: app.userNm,
          scholarshipNm: app.scholarshipNm,
          state: app.state,
          applicationState: app.applicationState,
          hasDocuments: app.documents && app.documents.length > 0,
          documentsCount: app.documents?.length || 0
        })))
        
        // APPROVED 상태인 applications만 필터링 (서류 존재 여부는 선택사항으로 처리)
        const documentsData = allApplications.filter(app => {
          const isApproved = app.state === 'APPROVED' || app.applicationState === 'APPROVED'
          console.log(`📝 Checking application ${app.userNm}-${app.scholarshipNm}: isApproved=${isApproved}, state=${app.state || app.applicationState}`)
          return isApproved
        })
        
        console.log('✅ Filtered APPROVED applications:', documentsData.length)
        console.log('✅ APPROVED applications details:', documentsData.map(app => ({
          userNm: app.userNm,
          userName: app.userName,
          scholarshipNm: app.scholarshipNm,
          scholarshipName: app.scholarshipName,
          state: app.state || app.applicationState,
          documentsCount: app.documents?.length || 0
        })))
        
        setDocuments(documentsData)
        calculateStats(documentsData)
      } else {
        console.log('❌ API returned success=false:', result)
        setDocuments([])
        calculateStats([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch documents:', error)
      if (error.message?.includes('500') || error.message?.includes('서버 내부 오류')) {
        setDocuments([])
        calculateStats([])
        console.log('🔄 No documents available yet - server error')
      } else {
        alert('서류 목록을 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }

  const calculateStats = (data) => {
    const totalApproved = data.length // APPROVED 상태만 필터링했으므로
    const paidCount = data.filter(app => app.mileagePaid).length // 서버에서 받아온 실제 지급 상태 사용
    const pendingPayment = totalApproved - paidCount
    
    // 아직 지급되지 않은 마일리지만 계산 (지급 예정 금액)
    const pendingAmount = data
      .filter(app => !app.mileagePaid) // 아직 지급되지 않은 것만
      .reduce((sum, app) => sum + (app.scholarshipAmount || 0), 0)
    
    // 이미 지급된 마일리지 총액
    const paidAmount = data
      .filter(app => app.mileagePaid) // 이미 지급된 것만
      .reduce((sum, app) => sum + (app.scholarshipAmount || 0), 0)

    setStats([
      { label: '마일리지 지급 대기', value: pendingPayment },
      { label: '마일리지 지급 완료', value: paidCount },
      { label: '총 지급 예정 금액', value: `${pendingAmount.toLocaleString()}원` },
      { label: '총 지급 완료 금액', value: `${paidAmount.toLocaleString()}원` },
    ])
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.scholarshipName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 이 페이지는 APPROVED 상태만 보여주는 페이지이므로 탭 필터링 로직 단순화
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'paid' && doc.mileagePaid) ||
      (activeTab === 'pending' && !doc.mileagePaid)
    
    // 장학금 필터링
    const matchesScholarship = scholarshipFilter === 'all' || 
      doc.scholarshipNm?.toString() === scholarshipFilter
    
    return matchesSearch && matchesTab && matchesScholarship
  })

  // 장학금 목록 생성 (필터링용) - 지원자 수와 함께 표시
  const scholarshipOptions = documents.reduce((acc, doc) => {
    const key = doc.scholarshipNm?.toString()
    if (key && !acc.some(item => item.value === key)) {
      // 해당 장학금의 지원자 수 계산
      const applicantCount = documents.filter(d => d.scholarshipNm?.toString() === key).length
      
      acc.push({
        value: key,
        label: `${doc.scholarshipName} (${applicantCount}명)`,
        name: doc.scholarshipName
      })
    }
    return acc
  }, []).sort((a, b) => a.label.localeCompare(b.label))

  const paidCount = documents.filter(doc => doc.mileagePaid).length
  const pendingCount = documents.length - paidCount

  const tabs = [
    { key:'all', label:`전체 (${documents.length})`, active: activeTab === 'all' },
    { key:'pending', label:`지급 대기 (${pendingCount})`, active: activeTab === 'pending' },
    { key:'paid', label:`지급 완료 (${paidCount})`, active: activeTab === 'paid' },
  ]

  const handleSearch = () => {
    // 검색 로직은 이미 filteredDocuments에서 처리됨
  }

  const handleViewDetails = async (document) => {
    try {
      console.log('🔍 Fetching detailed application data for:', document.userNm, document.scholarshipNm)
      const result = await api.get(`/applications/${document.userNm}/${document.scholarshipNm}`)
      console.log('📊 Detailed application data:', result)
      
      // 백엔드에서 받아온 데이터를 그대로 사용하되, 누락된 필드만 보완
      const enrichedDocument = {
        ...result,
        // 기존 documents 배열에서 해당 문서의 정보로 보완 (백엔드 데이터 우선)
        scholarshipName: result.scholarshipName || document.scholarshipName || '정보 없음',
        userName: result.userName || document.userName || document.userNm,
        // 백엔드에서 받아온 장학금 정보를 그대로 사용
        scholarshipType: result.scholarshipType || '정보 없음',
        scholarshipAmount: result.scholarshipAmount || 0, // 백엔드에서 받아온 실제 장학금 금액 사용
        scholarshipDescription: result.scholarshipDescription || '정보 없음',
        // 기타 필드들
        studentId: result.studentId || document.studentId || result.userNm,
        departmentName: result.departmentName || result.deptName || '정보 없음',
        collegeName: result.collegeName || '정보 없음',
        universityName: result.universityName || result.univName || '정보 없음',
        // 마일리지 지급 상태는 백엔드에서 받아온 값 사용
        mileagePaid: result.mileagePaid || false
      }
      
      console.log('✨ Enriched document data:', enrichedDocument)
      setSelectedDocument(enrichedDocument)
      setShowDetailModal(true)
      setMileageInput('')
    } catch (error) {
      console.error('Failed to fetch document details:', error)
      alert('상세 정보를 불러오는데 실패했습니다.')
    }
  }

  // DocTable을 위한 데이터 변환
  const transformDocumentData = (doc) => {
    // 서류 목록 처리
    const files = doc.documents && doc.documents.length > 0 
      ? doc.documents.slice(0, 3).map(d => d.originalFileName || '서류')
      : ['서류 없음'];
    
    if (doc.documents && doc.documents.length > 3) {
      files.push(`외 ${doc.documents.length - 3}개`);
    }

    // 상태 결정 - 서버 데이터 기준으로 판단
    let status = '검토 대기';
    if (doc.mileagePaid || paymentStatus[doc.userNm]) {
      status = '완료';
    }

    return {
      id: `${doc.userNm}-${doc.scholarshipNm}`,
      applicant: doc.userName || doc.userNm,
      studentId: doc.studentId || '학번 정보 없음',
      scholarship: doc.scholarshipName,
      unit: '', // 빈 값
      files: files,
      time: doc.appliedAt ? new Date(doc.appliedAt).toLocaleDateString('ko-KR') + ' ' + new Date(doc.appliedAt).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'}) : '정보 없음',
      status: status,
      // 원본 문서 정보 유지
      userNm: doc.userNm,
      scholarshipNm: doc.scholarshipNm,
      onApprove: () => {
        handleViewDetails(doc);
      },
      onReject: () => alert('반려 기능은 현재 지원되지 않습니다.')
    }
  }

  const handleApproveDocument = async () => {
    if (isProcessing) {
      console.log('🚫 Approval blocked - already processing')
      return
    }

    // 이미 마일리지가 지급된 경우 차단
    if (selectedDocument.mileagePaid) {
      alert('이미 마일리지가 지급된 신청서입니다.')
      return
    }

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
      setIsProcessing(true)
      console.log('💰 Processing mileage payment...')
      
      // 서류 승인 및 마일리지 지급 API 호출
      const response = await api.post('/applications/documents/approve', {
        userNm: selectedDocument.userNm,
        scholarshipNm: selectedDocument.scholarshipNm,
        mileage: mileage
      })
      
      if (response.success) {
        alert(`서류가 승인되었으며 ${mileage} 마일리지가 지급되었습니다.`)
        
        // 로컬 상태도 업데이트
        setPaymentStatus(prev => ({
          ...prev,
          [selectedDocument.userNm]: true
        }))
        
        setShowDetailModal(false)
        setMileageInput('')
        
        // 서버에서 최신 데이터를 받아오기 위해 즉시 새로고침
        fetchDocuments(true)
      } else {
        alert(response.message || '서류 승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to approve document:', error)
      // 중복 지급 에러 메시지 처리
      if (error.response?.data?.message?.includes('이미 지급')) {
        alert('이미 마일리지가 지급된 신청서입니다.')
      } else {
        alert('서류 승인에 실패했습니다.')
      }
    } finally {
      setIsProcessing(false)
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

  // 사이드바 토글 핸들러
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
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main className="admin-main">
          <div className="page-header">
            <h1 className="page-title">마일리지 지급 관리</h1>
            <p className="page-description">승인된 장학금 신청에 대해 마일리지를 지급할 수 있습니다.</p>
          </div>

          {/* 검색바 및 필터 */}
          <div className="topbar">
            <input
              type="text"
              className="search"
              placeholder="사용자명 또는 장학금명으로 검색..."
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
          <DocTable 
            rows={filteredDocuments.map(transformDocumentData)}
            onViewDetails={handleViewDetails}
          />
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
                <h4>장학금 정보</h4>
                <p><strong>장학금명:</strong> {selectedDocument.scholarshipName}</p>
                <p><strong>장학금 종류:</strong> {selectedDocument.scholarshipType || '정보 없음'}</p>
                <p><strong>기본 지급 금액:</strong> {selectedDocument.scholarshipAmount ? `${selectedDocument.scholarshipAmount?.toLocaleString()}원` : '정보 없음'}</p>
                <p><strong>지급 방식:</strong> {selectedDocument.paymentMethod || '정보 없음'}</p>
                <p><strong>장학금 설명:</strong> {selectedDocument.scholarshipDescription || '정보 없음'}</p>
              </div>

              <div className="detail-section">
                <h4>신청자 정보</h4>
                <p><strong>이름:</strong> {selectedDocument.userName || selectedDocument.userNm}</p>
                <p><strong>학번:</strong> {selectedDocument.studentId || '정보 없음'}</p>
                <p><strong>학과:</strong> {selectedDocument.departmentName || '정보 없음'}</p>
                <p><strong>단과대:</strong> {selectedDocument.collegeName || '정보 없음'}</p>
                <p><strong>신청일:</strong> {selectedDocument.appliedAt ? new Date(selectedDocument.appliedAt).toLocaleDateString('ko-KR') : '정보 없음'}</p>
                <p>
                  <strong>신청 상태:</strong>
                  <span className="status-badge approved">승인</span>
                </p>
                <p>
                  <strong>마일리지 지급 상태:</strong>
                  <span className={`status-badge ${
                    selectedDocument.mileagePaid ? 'paid' : 'pending-payment'
                  }`}>
                    {selectedDocument.mileagePaid ? '지급 완료' : '지급 대기'}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h4>제출 서류</h4>
                <div className="documents-list">
                  {selectedDocument.documents && selectedDocument.documents.length > 0 ? (
                    selectedDocument.documents.map((doc, index) => (
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
                    ))
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px dashed #d1d5db'
                    }}>
                      📋 제출된 서류가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>마일리지 지급</h4>
                
                {/* 장학금 기본 금액 표시 및 선택 옵션 */}
                <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9ff', borderRadius: '8px', border: '1px solid #e0e4ff'}}>
                  <p style={{margin: '0 0 8px', fontSize: '14px', color: '#4f46e5', fontWeight: '600'}}>
                    장학금 기본 지급 금액: {selectedDocument.scholarshipAmount ? `${selectedDocument.scholarshipAmount.toLocaleString()}원` : '정보 없음'}
                  </p>
                  {selectedDocument.scholarshipAmount && (
                    <button
                      type="button"
                      onClick={() => setMileageInput(selectedDocument.scholarshipAmount.toString())}
                      disabled={selectedDocument.mileagePaid}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        opacity: selectedDocument.mileagePaid ? '0.5' : '1'
                      }}
                    >
                      기본 금액으로 설정
                    </button>
                  )}
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <input
                    type="number"
                    placeholder={selectedDocument.mileagePaid ? "마일리지 지급 완료" : "지급할 마일리지 입력"}
                    value={selectedDocument.mileagePaid ? '' : mileageInput}
                    onChange={(e) => setMileageInput(e.target.value)}
                    disabled={selectedDocument.mileagePaid}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      flex: 1,
                      fontSize: '14px',
                      backgroundColor: selectedDocument.mileagePaid ? '#f9fafb' : 'white',
                      cursor: selectedDocument.mileagePaid ? 'not-allowed' : 'text'
                    }}
                    min="0"
                  />
                  <span style={{color: '#6b7280', fontSize: '14px'}}>마일리지</span>
                </div>
                <p style={{fontSize: '12px', color: '#6b7280'}}>
                  {selectedDocument.mileagePaid 
                    ? "* 마일리지 지급이 완료되었습니다."
                    : "* 승인 시 입력한 마일리지가 사용자에게 지급됩니다."
                  }
                </p>
              </div>
            </div>
            <div className="modal-footer">
              {selectedDocument.mileagePaid ? (
                <div style={{
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #16a34a',
                  borderRadius: '6px',
                  color: '#15803d',
                  fontWeight: '600'
                }}>
                  ✅ 마일리지 지급이 완료되었습니다.
                </div>
              ) : (
                <>
                  <button 
                    className="reject-btn-modal" 
                    onClick={handleRejectDocument}
                    disabled={selectedDocument.mileagePaid}
                    style={{
                      opacity: selectedDocument.mileagePaid ? '0.5' : '1',
                      cursor: selectedDocument.mileagePaid ? 'not-allowed' : 'pointer'
                    }}
                  >
                    반려
                  </button>
                  <button 
                    className="approve-btn-modal" 
                    onClick={handleApproveDocument}
                    disabled={selectedDocument.mileagePaid}
                    style={{
                      opacity: selectedDocument.mileagePaid ? '0.5' : '1',
                      cursor: selectedDocument.mileagePaid ? 'not-allowed' : 'pointer'
                    }}
                  >
                    마일리지 지급
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