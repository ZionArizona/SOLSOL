// src/pages/NoticeEdit.jsx
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { findNotice, patchNotice, deleteNotice } from '../lib/noticeStore'
import './notice-detail.css'

export default function NoticeEdit(){
  const { id } = useParams()
  const nav = useNavigate()
  const initial = useLocation().state?.notice || findNotice(id)

  const [form, setForm] = useState(null)
  useEffect(()=>{
    if(initial){
      setForm({
        title:initial.title, content:initial.content,
        priority:initial.priority, category:initial.category,
        tags:(initial.tags||[]).join(', '),
        publishDate: toLocal(initial.publishDate), expireDate: toLocal(initial.expireDate),
        pin: !!initial.pin, allowComments: !!initial.allowComments,
      })
    }
  }, [id])

  if(!form){
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

  const set = (k,v)=> setForm(prev => ({...prev, [k]:v}))
  const payload = {
    title:form.title,
    content:form.content,
    priority:form.priority,
    category:form.category,
    tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
    publishDate: form.publishDate || null,
    expireDate: form.expireDate || null,
    pin: form.pin,
    allowComments: form.allowComments,
  }

  const save = ()=>{
    patchNotice(id, payload)
    alert('저장되었습니다.')
    nav(`/admin/notices/${id}`, { state:{ notice: findNotice(id) } })
  }
  const draft = ()=>{
    patchNotice(id, { ...payload, status:'draft' })
    alert('임시저장되었습니다.')
    nav(`/admin/notices/${id}`, { state:{ notice: findNotice(id) } })
  }
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
            <div className="left"><h1 className="d-title">공지사항 수정</h1></div>
            <div className="right">
              <button className="btn ghost" onClick={()=>nav(-1)}>돌아가기</button>
              <button className="btn danger" onClick={remove}>삭제</button>
              <button className="btn" onClick={draft}>임시저장</button>
              <button className="btn primary" onClick={save}>저장</button>
            </div>
          </div>

          <section className="panel">
            <div className="form-grid">
              <label className="fg full">
                <span>제목 *</span>
                <input value={form.title} onChange={e=>set('title', e.target.value)} placeholder="제목을 입력하세요"/>
              </label>

              <div className="row">
                <label className="fg">
                  <span>우선순위</span>
                  <select value={form.priority} onChange={e=>set('priority', e.target.value)}>
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </label>
                <label className="fg">
                  <span>카테고리</span>
                  <select value={form.category} onChange={e=>set('category', e.target.value)}>
                    <option value="general">일반</option>
                    <option value="urgent">긴급</option>
                    <option value="scholarship">장학금</option>
                    <option value="academic">학사</option>
                    <option value="event">행사</option>
                  </select>
                </label>
              </div>

              <label className="fg full">
                <span>내용 *</span>
                <textarea rows={10} value={form.content} onChange={e=>set('content', e.target.value)} placeholder="공지 내용을 입력하세요"/>
              </label>

              <label className="fg full">
                <span>태그 (쉼표로 구분)</span>
                <input value={form.tags} onChange={e=>set('tags', e.target.value)} placeholder="예: 장학금, 모집, 긴급"/>
              </label>

              <div className="row">
                <label className="fg">
                  <span>발행 일시</span>
                  <input type="datetime-local" value={form.publishDate||''} onChange={e=>set('publishDate', e.target.value)}/>
                </label>
                <label className="fg">
                  <span>만료 일시</span>
                  <input type="datetime-local" value={form.expireDate||''} onChange={e=>set('expireDate', e.target.value)}/>
                </label>
              </div>

              <div className="checks">
                <label><input type="checkbox" checked={form.pin} onChange={e=>set('pin', e.target.checked)}/> 상단 고정</label>
                <label><input type="checkbox" checked={form.allowComments} onChange={e=>set('allowComments', e.target.checked)}/> 댓글 허용</label>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

function toLocal(str){
  if(!str) return ''
  const d = new Date(str); d.setMinutes(d.getMinutes()-d.getTimezoneOffset())
  return d.toISOString().slice(0,16)
}
