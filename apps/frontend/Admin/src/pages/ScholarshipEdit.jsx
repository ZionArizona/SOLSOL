import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ScholarshipForm from '../components/ScholarshipForm'
import { findScholarship, patchScholarship, deleteScholarship } from '../lib/ScholarshipStore'
import '../pages/scholarship-create.css'   // 기존 폼 스타일 재사용

export default function ScholarshipEdit(){
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)

  useEffect(()=>{ setData(findScholarship(id)) }, [id])

  if(!data){
    return <>
      <Navbar/><div className="admin-layout"><Sidebar/><main className="admin-main"><div className="empty">장학금을 찾을 수 없습니다.</div></main></div>
    </>
  }

  const save = (payload)=>{
    patchScholarship(id, payload)
    alert('저장되었습니다.')
    nav(`/admin/scholarships/${id}`)
  }
  const remove = ()=>{
    if(confirm('삭제할까요?')){ deleteScholarship(Number(id)); nav('/admin/scholarships') }
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
