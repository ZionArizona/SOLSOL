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
      if (result.success) {
        setApplications(result.data)
        calculateStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      alert('신청서 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.length
    const pending = data.filter(app => app.applicationState === 'PENDING').length
    const approved = data.filter(app => app.applicationState === 'APPROVED').length
    const rejected = data.filter(app => app.applicationState === 'REJECTED').length

    setStats([
      { label: '등록 서류', value: total },
      { label: '검토 대기', value: pending },
      { label: '승인 완료', value: approved },
      { label: '반려', value: rejected },
    ])
  }

  const handleApproval = async (userNm, scholarshipNm, action) => {
    try {
      if (action === 'approve') {
        await api.put(`/applications/${userNm}/${scholarshipNm}/approve`, {
          reviewComment: '승인되었습니다.'
        })
      } else {
        await api.put(`/applications/${userNm}/${scholarshipNm}/reject`, {
          reviewComment: '검토 결과 반려되었습니다.'
        })
      }
      
      alert(`신청서가 ${action === 'approve' ? '승인' : '반려'}되었습니다.`)
      fetchApplications()
    } catch (error) {
      console.error(`Failed to ${action} application:`, error)
      alert(`신청서 ${action === 'approve' ? '승인' : '반려'}에 실패했습니다.`)
    }
  }

  const transformApplicationData = (application) => ({
    id: `${application.userNm}-${application.scholarshipNm}`,
    scholarship: application.scholarshipName || '장학금명 없음',
    unit: 'SCC000-학과정보 없음',
    files: application.documents?.map(doc => doc.documentName) || [],
    applicant: application.userName || '신청자명 없음',
    studentId: `${application.userNm} - 학과정보 없음`,
    time: new Date(application.applicationDate).toLocaleString('ko-KR') || '-',
    status: application.applicationState === 'PENDING' ? '검토 대기' :
             application.applicationState === 'APPROVED' ? '승인' : '반려',
    userNm: application.userNm,
    scholarshipNm: application.scholarshipNm,
    onApprove: () => handleApproval(application.userNm, application.scholarshipNm, 'approve'),
    onReject: () => handleApproval(application.userNm, application.scholarshipNm, 'reject')
  })

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.scholarshipName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'pending') return matchesSearch && app.applicationState === 'PENDING'
    if (activeTab === 'approved') return matchesSearch && app.applicationState === 'APPROVED'
    if (activeTab === 'rejected') return matchesSearch && app.applicationState === 'REJECTED'
    
    return matchesSearch
  })

  const tabs = [
    { key:'all', label:`전체 (${applications.length})`, active: activeTab === 'all' },
    { key:'pending', label:`검토 대기 (${stats[1].value})`, active: activeTab === 'pending' },
    { key:'approved', label:`승인 (${stats[2].value})`, active: activeTab === 'approved' },
    { key:'rejected', label:`반려 (${stats[3].value})`, active: activeTab === 'rejected' },
  ]

  const handleSearch = () => {
    // 검색 로직은 이미 filteredApplications에서 처리됨
  }

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar/>
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
        <Sidebar/>
        <main className="admin-main">
          {/* 상단 우측 검색 */}
          <div className="topbar">
            <input 
              className="search" 
              placeholder="학과명, 학번, 서류명으로 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          />
        </main>
      </div>
    </>
  )
}
