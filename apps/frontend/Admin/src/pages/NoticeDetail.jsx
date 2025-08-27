// src/pages/NoticeDetail.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatusPill from '../components/StatusPill'
import TagChips from '../components/TagChips'
import { noticeApi } from '../lib/noticeStore'
import './notice-detail.css'

export default function NoticeDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const passed = useLocation().state?.notice || null

  const [data, setData] = useState(passed)
  const [loading, setLoading] = useState(!passed)

  useEffect(()=>{
    if(!data){ 
      fetchNotice()
    }
  }, [id])

  const fetchNotice = async () => {
    try {
      const notice = await noticeApi.getNotice(id)
      setData(notice)
    } catch (error) {
      console.error('Failed to fetch notice:', error)
    } finally {
      setLoading(false)
    }
  }

  if(loading) {
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar/>
          <main className="admin-main"><div className="empty">로딩 중...</div></main>
        </div>
      </>
    )
  }

  if(!data) {
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar/>
          <main className="admin-main"><div className="empty">공지사항을 찾을 수 없습니다.</div></main>
        </div>
      </>
    )
  }

  const tstr = (d)=> d ? new Date(d).toLocaleString('ko-KR') : '-'


  const publish = async ()=> {
    try {
      const updated = await noticeApi.updateNotice(id, { status: 'published' })
      setData(updated)
    } catch (error) {
      console.error('Failed to publish notice:', error)
    }
  }

  const unpublish = async ()=> {
    try {
      const updated = await noticeApi.updateNotice(id, { status: 'draft' })
      setData(updated)
    } catch (error) {
      console.error('Failed to unpublish notice:', error)
    }
  }

  const remove = async ()=>{
    if(confirm('정말 삭제할까요?')){
      try {
        await noticeApi.deleteNotice(id)
        nav('/admin/notices')
      } catch (error) {
        console.error('Failed to delete notice:', error)
      }
    }
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar/>
        <main className="admin-main">

          <div className="detail-head">
            <div className="left">
              <h1 className="d-title">{data.title}</h1>
              <div className="meta">
                <span>✍ {data.author}</span>
                <span>📅 {tstr(data.publishDate || data.created)}</span>
                <StatusPill status={data.status}/>
              </div>
            </div>

            <div className="right">
              <button className="btn ghost" onClick={()=>nav('/admin/notices')}>목록으로</button>
              <button className="btn" onClick={()=>nav(`/admin/notices/${id}/edit`, { state:{ notice:data }})}>수정</button>
              <button className="btn danger" onClick={remove}>삭제</button>
            </div>
          </div>

          <section className="panel">
            <div className="row2">
              <div>
                <TagChips tags={data.tags}/>
                <article className="content">{data.content}</article>
              </div>

              <aside className="side">
                <div className="side-box">
                  <div className="side-title">발행 정보</div>
                  <div className="side-item"><span>발행</span><b>{tstr(data.publishDate)}</b></div>
                  <div className="side-item"><span>만료</span><b>{tstr(data.expireDate)}</b></div>
                </div>
              </aside>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}
