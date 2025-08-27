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
      transformedData.tags = tagsData
      transformedData.notices = noticesData
      
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
      await scholarshipApi.updateScholarship(id, updateData)
      alert('저장되었습니다.')
      nav(`/admin/scholarships/${id}`)
    } catch (error) {
      console.error('Failed to update scholarship:', error)
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
