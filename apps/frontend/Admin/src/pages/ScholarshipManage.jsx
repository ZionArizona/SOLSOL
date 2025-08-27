import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import Toolbar from '../components/Toolbar'
import FilterBar from '../components/FilterBar'
import ScholarshipCard from '../components/ScholarshipCard'
import { api } from '../utils/api'
import './scholarship-manage.css'

export default function ScholarshipManage(){
  const [scholarships, setScholarships] = useState([])
  const [stats, setStats] = useState([
    { label: '전체 장학금', value: 0 },
    { label: '모집 중', value: 0 },
    { label: '내가 등록한 장학금', value: 0 },
    { label: '총 지원자수', value: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      const result = await api.get('/scholarships')
      if (result.success) {
        setScholarships(result.data)
        calculateStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch scholarships:', error)
      alert('장학금 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.length
    const recruiting = data.filter(s => s.recruitmentStatus === 'OPEN').length
    
    setStats([
      { label: '전체 장학금', value: total },
      { label: '모집 중', value: recruiting },
      { label: '내가 등록한 장학금', value: total },
      { label: '총 지원자수', value: 0 },
    ])
  }

  const handleCreateScholarship = () => {
    navigate('/admin/scholarships/regist')
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

  const transformScholarshipData = (scholarship) => ({
    id: scholarship.scholarshipNm,
    title: scholarship.scholarshipName,
    tag: scholarship.recruitmentStatus === 'OPEN' ? '모집중' : 
         scholarship.recruitmentStatus === 'CLOSED' ? '모집완료' : '모집예정',
    amount: `${scholarship.amount?.toLocaleString() || 0}원`,
    picks: `${scholarship.numberOfRecipients || 0}명`,
    applied: '0명',
    status: scholarship.recruitmentStatus === 'OPEN' ? '모집중' : '대기',
    progress: scholarship.recruitmentStatus === 'OPEN' ? 50 : 0,
    method: '서류 심사',
    chips: [scholarship.type || '일반'],
    onEdit: () => navigate(`/admin/scholarships/${scholarship.scholarshipNm}/edit`),
    onDelete: () => handleDeleteScholarship(scholarship.scholarshipNm)
  })

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
          {/* 상단 액션 툴바 */}
          <Toolbar
            buttons={[
              { label:'일괄', onClick:()=>alert('일괄 작업 기능 준비 중') },
              { label:'마이리스트 필터링', onClick:()=>alert('내가 등록한 장학금만 보기') },
              { label:'장학금 추가하기', tone:'primary', onClick:handleCreateScholarship },
            ]}
          />

          {/* 통계 카드 */}
          <StatCards items={stats} />

          {/* 필터 바 */}
          <FilterBar
            onSearch={(q)=>console.log('search:', q)}
            onReset={()=>console.log('reset')}
            filters={[
              {label:'선발 여부', type:'checkbox', value:false},
              {label:'전체', type:'radio', name:'status', value:true},
              {label:'카테고리', type:'select', options:['전체','성적','생활','활동','기타']},
              {label:'상태', type:'select', options:['전체','모집중','모집예정','모집완료']},
            ]}
          />

          {/* 카드 그리드 */}
          <section className="grid">
            {scholarships.length === 0 ? (
              <div style={{textAlign: 'center', padding: '50px', gridColumn: '1/-1'}}>
                등록된 장학금이 없습니다.
              </div>
            ) : (
              scholarships.map(scholarship => 
                <ScholarshipCard 
                  key={scholarship.scholarshipNm} 
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
