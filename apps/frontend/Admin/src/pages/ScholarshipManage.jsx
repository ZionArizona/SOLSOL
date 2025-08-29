import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import Toolbar from '../components/Toolbar'
import FilterBar from '../components/FilterBar'
import ScholarshipCard from '../components/ScholarshipCard'
import { api } from '../utils/api'
import './Scholarship-manage.css'

export default function ScholarshipManage(){
  const [scholarships, setScholarships] = useState([])
  const [filteredScholarships, setFilteredScholarships] = useState([])
  const [applicationCounts, setApplicationCounts] = useState({}) // 장학금별 지원자 수
  const [stats, setStats] = useState([
    { label: '전체 장학금', value: 0 },
    { label: '모집 중', value: 0 },
    { label: '내가 등록한 장학금', value: 0 },
    { label: '총 지원자수', value: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // 사이드바 상태
  const navigate = useNavigate()

  const getScholarshipTypeLabel = (type) => {
    const typeMap = {
      'ACADEMIC': '성적우수',
      'FINANCIAL_AID': '생활지원',
      'ACTIVITY': '활동우수',
      'OTHER': '기타'
    }
    return typeMap[type] || '일반'
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      const result = await api.get('/scholarships')
      if (result?.success === true) {
        const list = Array.isArray(result.data) ? result.data : [];
        setScholarships(list);
        setFilteredScholarships(list);
        await fetchApplicationCounts(list); // 지원자 수 조회
        calculateStats(list);
        return; // 정상 종료 (alert 없음)
      }

      const msg =
        result?.message ||
        '장학금 목록 요청이 실패했습니다. 잠시 후 다시 시도해주세요.';
      alert(msg);

    } catch (error) {
      console.error('Failed to fetch scholarships:', error)
      alert('서버와 통신에 실패했습니다. 네트워크 상태를 확인해주세요.');
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationCounts = async (scholarshipList) => {
    try {
      // 모든 신청서 데이터를 가져와서 장학금별로 집계
      const applicationsResult = await api.get('/applications')
      if (applicationsResult.success && Array.isArray(applicationsResult.data)) {
        const counts = {}
        applicationsResult.data.forEach(application => {
          const scholarshipId = application.scholarshipNm?.toString()
          if (scholarshipId) {
            counts[scholarshipId] = (counts[scholarshipId] || 0) + 1
          }
        })
        setApplicationCounts(counts)
      }
    } catch (error) {
      console.error('Failed to fetch application counts:', error)
      setApplicationCounts({})
    }
  }

  const calculateStats = async (data) => {
    const total = data.length
    const recruiting = data.filter(s => s.recruitmentStatus === 'OPEN').length
    
    // 총 지원자 수 계산 - 각 장학금별 신청자 수를 합산
    let totalApplications = 0
    try {
      // 모든 신청서 데이터를 가져와서 카운트
      const applicationsResult = await api.get('/applications')
      if (applicationsResult.success && Array.isArray(applicationsResult.data)) {
        totalApplications = applicationsResult.data.length
      }
    } catch (error) {
      console.error('Failed to fetch applications for stats:', error)
    }
    
    setStats([
      { label: '전체 장학금', value: total },
      { label: '모집 중', value: recruiting },
      { label: '내가 등록한 장학금', value: total },
      { label: '총 지원자수', value: totalApplications },
    ])
  }

  const applyFilters = () => {
    let filtered = [...scholarships]
    
    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(s => 
        s.scholarshipName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // 카테고리 필터
    if (selectedCategory !== '전체') {
      const categoryMap = {
        '성적': 'ACADEMIC',
        '생활': 'FINANCIAL_AID', 
        '활동': 'ACTIVITY',
        '기타': 'OTHER'
      }
      filtered = filtered.filter(s => s.type === categoryMap[selectedCategory])
    }
    
    // 상태 필터
    if (selectedStatus !== '전체') {
      const statusMap = {
        '모집중': 'OPEN',
        '모집예정': 'PENDING',
        '모집완료': 'CLOSED'
      }
      filtered = filtered.filter(s => s.recruitmentStatus === statusMap[selectedStatus])
    }
    
    setFilteredScholarships(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory('전체')
    setSelectedStatus('전체')
    setFilteredScholarships(scholarships)
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedCategory, selectedStatus, scholarships])

  const handleCreateScholarship = () => {
    navigate('/scholarships/regist')
  }

  const handleDeleteScholarship = async (id) => {
    if (!confirm('정말로 이 장학금을 삭제하시겠습니까?')) return
    
    try {
      await api.delete(`/scholarships/${id}`)
      alert('장학금이 삭제되었습니다.')
      fetchScholarships()
    } catch (error) {
      console.error('Failed to delete scholarship:', error)
      alert('장학금 삭제에 실패했습니다.')
    }
  }

  const handleCopyScholarship = async (id) => {
    try {
      const result = await api.get(`/scholarships/${id}`)
      if (result.success) {
        // 복사된 데이터에서 고유 필드들 제거
        const copyData = {
          ...result.data,
          scholarshipName: `${result.data.scholarshipName} (복사본)`,
          // id와 생성일시 등은 제거
        }
        delete copyData.id
        delete copyData.createdAt
        delete copyData.updatedAt
        
        const createResult = await api.post('/scholarships', copyData)
        if (createResult.success) {
          alert('장학금이 복사되었습니다.')
          fetchScholarships()
        }
      }
    } catch (error) {
      console.error('Failed to copy scholarship:', error)
      alert('장학금 복사에 실패했습니다.')
    }
  }

  const transformScholarshipData = (scholarship) => {
    // 날짜 기반 실제 모집상태 계산
    const now = new Date()
    const startDate = scholarship.recruitmentStartDate ? new Date(scholarship.recruitmentStartDate) : null
    const endDate = scholarship.recruitmentEndDate ? new Date(scholarship.recruitmentEndDate) : null
    
    let actualStatus = '모집예정'
    let actualTag = '모집예정'
    
    if (startDate && endDate) {
      if (now >= startDate && now <= endDate) {
        actualStatus = '모집중'
        actualTag = '모집중'
      } else if (now > endDate) {
        actualStatus = '모집완료'
        actualTag = '모집완료'
      }
      // else는 모집예정 유지
    } else if (scholarship.recruitmentStatus === 'OPEN') {
      actualStatus = '모집중'
      actualTag = '모집중'
    } else if (scholarship.recruitmentStatus === 'CLOSED') {
      actualStatus = '모집완료'
      actualTag = '모집완료'
    }
    
    // 실제 지원자 수 조회
    const applicationCount = applicationCounts[scholarship.id?.toString()] || 0
    
    return {
      id: scholarship.id,
      title: scholarship.scholarshipName,
      tag: actualTag,
      amount: `${scholarship.amount?.toLocaleString() || 0}원`,
      picks: `${scholarship.numberOfRecipients || 0}명`,
      applied: `${applicationCount}명`, // 실제 지원자 수 사용
      status: actualStatus,
      progress: actualStatus === '모집중' ? 50 : 0,
      method: scholarship.evaluationMethod === 'DOCUMENT_INTERVIEW' ? '서류 + 면접' : '서류 심사',
      chips: [getScholarshipTypeLabel(scholarship.type)],
      onDetail: () => navigate(`/admin/scholarships/${scholarship.id}`),
      onApplicants: () => navigate(`/admin/submissions?scholarship=${scholarship.id}`),
      onCopy: () => handleCopyScholarship(scholarship.id),
      onEdit: () => navigate(`/admin/scholarships/${scholarship.id}/edit`),
      onDelete: () => handleDeleteScholarship(scholarship.id)
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
          {/* 상단 액션 툴바 */}
          <Toolbar
            buttons={[
              { label:'내가 등록한 장학금만 보기', onClick:()=>alert('내가 등록한 장학금만 보기') },
              { label:'장학금 추가하기', tone:'primary', onClick:handleCreateScholarship },
            ]}
          />

          {/* 통계 카드 */}
          <StatCards items={stats} />

          {/* 필터 바 */}
          <FilterBar
            onSearch={handleSearch}
            onReset={handleReset}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
            filters={[
              {label:'선발 여부', type:'checkbox', value:false},
              {label:'카테고리', type:'select', options:['전체','성적','생활','활동','기타']},
              {label:'상태', type:'select', options:['전체','모집중','모집예정','모집완료']},
            ]}
          />

          {/* 카드 그리드 */}
          <section className="grid">
            {filteredScholarships.length === 0 ? (
              <div style={{textAlign: 'center', padding: '50px', gridColumn: '1/-1'}}>
                {scholarships.length === 0 ? '등록된 장학금이 없습니다.' : '검색 결과가 없습니다.'}
              </div>
            ) : (
              filteredScholarships.map(scholarship => 
                <ScholarshipCard 
                  key={scholarship.id} 
                  data={transformScholarshipData(scholarship)} 
                />
              )
            )}
          </section>
        </main>
      </div>
    </>
  )
}
