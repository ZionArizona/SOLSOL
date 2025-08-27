import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ScholarshipForm from '../components/ScholarshipForm'
import { scholarshipApi, scholarshipUtils } from '../lib/ScholarshipStore'
import '../pages/scholarship-create.css'   // 기존 폼 스타일 재사용

export default function ScholarshipEdit(){
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScholarshipData()
  }, [id])

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const fetchScholarshipData = async () => {
    try {
      const scholarship = await scholarshipApi.getScholarship(id)
      
      // 추가 정보들도 함께 로드 (criteria, tags, notices)
      const [criteriaData, tagsData, noticesData] = await Promise.all([
        scholarshipApi.getCriteria(id),
        scholarshipApi.getTags(id),
        scholarshipApi.getNotices(id)
      ])
      
      const transformedData = scholarshipUtils.transformForFrontend(scholarship)
      
      // 추가 정보들을 transformedData에 포함
      transformedData.criteria = criteriaData.map(c => ({
        name: c.name,
        std: c.stdPoint,
        weight: c.weightPercent
      }))
      
      // 태그를 chips 형태로 변환 (ScholarshipForm에서 chips 필드를 사용)
      transformedData.chips = tagsData.map(tag => tag.name || tag.tagName || tag).join(', ')
      
      // categories 필드 설정 (이미 transformForFrontend에서 처리되지만 덮어쓰기)
      if (scholarship.category) {
        transformedData.categories = Array.isArray(scholarship.category) 
          ? scholarship.category.join(', ')
          : scholarship.category
      }
      
      // 공지사항 정보
      if (noticesData && noticesData.length > 0) {
        const firstNotice = noticesData[0]
        transformedData.notice = {
          title: firstNotice.title || firstNotice.noticeTitle,
          content: firstNotice.content || firstNotice.noticeContent
        }
      }
      
      // 심사 관련 정보 (ScholarshipForm에서 judge 필드를 사용)
      transformedData.judge = {
        mode: scholarshipUtils.getEvaluationMethodLabel(scholarship.evaluationMethod) || '서류심사',
        interviewDate: formatDateForInput(scholarship.interviewDate),
        judgeStart: formatDateForInput(scholarship.evaluationStartDate),
        resultDate: formatDateForInput(scholarship.resultAnnouncementDate)
      }
      
      // 날짜 필드들도 form 입력용 형식으로 변환
      transformedData.startDate = formatDateForInput(scholarship.recruitmentStartDate)
      transformedData.endDate = formatDateForInput(scholarship.recruitmentEndDate)
      
      setData(transformedData)
    } catch (error) {
      console.error('Failed to fetch scholarship:', error)
      alert('장학금 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if(loading){
    return <>
      <Navbar/><div className="admin-layout"><Sidebar/><main className="admin-main"><div className="empty">로딩 중...</div></main></div>
    </>
  }

  if(!data){
    return <>
      <Navbar/><div className="admin-layout"><Sidebar/><main className="admin-main"><div className="empty">장학금을 찾을 수 없습니다.</div></main></div>
    </>
  }

  const save = async (payload) => {
    try {
      const updateData = scholarshipUtils.transformForBackend(payload)
      console.log('Sending update data:', updateData) // 디버깅용 로그
      await scholarshipApi.updateScholarship(id, updateData)
      alert('저장되었습니다.')
      nav(`/admin/scholarships/${id}`)
    } catch (error) {
      console.error('Failed to update scholarship:', error)
      console.error('Original payload:', payload) // 디버깅용 로그
      alert('저장에 실패했습니다: ' + error.message)
    }
  }
  
  const remove = async () => {
    if(confirm('삭제할까요?')) {
      try {
        await scholarshipApi.deleteScholarship(id)
        alert('삭제되었습니다.')
        nav('/admin/scholarships')
      } catch (error) {
        console.error('Failed to delete scholarship:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar/>
        <main className="admin-main">
          <div style={{display:'flex',justifyContent:'flex-end',gap:8, marginBottom:10}}>
            <button className="btn danger" onClick={remove}>삭제</button>
          </div>
          <ScholarshipForm initial={data} onSubmit={save} submitText="수정 저장"/>
        </main>
      </div>
    </>
  )
}
