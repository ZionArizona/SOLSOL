// src/pages/NoticeDetail.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatusPill from '../components/StatusPill'
import TagChips from '../components/TagChips'
import { findNotice, patchNotice, deleteNotice } from '../lib/noticeStore'
import './notice-detail.css'

export default function NoticeDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const passed = useLocation().state?.notice || null

  const [data, setData] = useState(passed)

  useEffect(()=>{
    if(!data){ setData(findNotice(id)) }
  }, [id])

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

  const togglePin = ()=> setData(patchNotice(id, { pin: !data.pin }))
  const publish = ()=> setData(patchNotice(id, { status: 'published' }))
  const unpublish = ()=> setData(patchNotice(id, { status: 'draft' }))
  const remove = ()=>{
    if(confirm('정말 삭제할까요?')){ deleteNotice(Number(id)); nav('/admin/notices') }
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
                {data.pin && <span className="pin">📌 상단 고정</span>}
              </div>
            </div>

            <div className="right">
              <button className="btn ghost" onClick={()=>nav('/admin/notices')}>목록으로</button>
              <button className="btn" onClick={()=>nav(`/admin/notices/${id}/edit`, { state:{ notice:data }})}>수정</button>
              {data.status==='published'
                ? <button className="btn warn" onClick={unpublish}>비공개</button>
                : <button className="btn primary" onClick={publish}>게시</button>}
              <button className={`btn ${data.pin?'primary':''}`} onClick={togglePin}>{data.pin?'고정해제':'상단고정'}</button>
              <button className="btn danger" onClick={remove}>삭제</button>
            </div>
          </div>

          <section className="panel">
            <div className="row2">
              <div>
                <dl className="kv">
                  <div><dt>카테고리</dt><dd>{data.category}</dd></div>
                  <div><dt>우선순위</dt><dd>{data.priority}</dd></div>
                  <div><dt>조회수</dt><dd>{data.views}</dd></div>
                  <div><dt>댓글</dt><dd>{data.comments}</dd></div>
                </dl>
                <TagChips tags={data.tags}/>
                <article className="content">{data.content}</article>
              </div>

              <aside className="side">
                <div className="side-box">
                  <div className="side-title">발행 정보</div>
                  <div className="side-item"><span>발행</span><b>{tstr(data.publishDate)}</b></div>
                  <div className="side-item"><span>만료</span><b>{tstr(data.expireDate)}</b></div>
                </div>
                <div className="side-box">
                  <div className="side-title">설정</div>
                  <div className="side-item"><span>댓글 허용</span><b>{data.allowComments?'예':'아니오'}</b></div>
                  <div className="side-item"><span>상단 고정</span><b>{data.pin?'예':'아니오'}</b></div>
                </div>
              </aside>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}
