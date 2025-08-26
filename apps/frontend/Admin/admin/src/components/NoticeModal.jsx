import { useEffect, useState } from 'react'

export default function NoticeModal({initial, onClose, onSave, onDraft}){
  const [form, setForm] = useState({
    title:'', content:'', priority:'medium', category:'general',
    tags:'', publishDate:'', expireDate:'', pin:false, allowComments:true,
  })
  useEffect(()=>{
    if(initial){
      setForm({
        title:initial.title, content:initial.content, priority:initial.priority, category:initial.category,
        tags:(initial.tags||[]).join(', '),
        publishDate: initial.publishDate ? toLocalDatetime(initial.publishDate) : '',
        expireDate: initial.expireDate ? toLocalDatetime(initial.expireDate) : '',
        pin: initial.pin, allowComments: initial.allowComments
      })
    }else{
      const now = new Date()
      now.setMinutes(now.getMinutes()-now.getTimezoneOffset())
      setForm(f=>({...f, publishDate: now.toISOString().slice(0,16)}))
    }
  },[initial])

  const set = (k,v)=> setForm(prev=>({...prev,[k]:v}))
  const payload = {
    title:form.title, content:form.content,
    priority:form.priority, category:form.category,
    tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
    publishDate: form.publishDate || null,
    expireDate: form.expireDate || null,
    pin: form.pin, allowComments: form.allowComments
  }

  return (
    <div className="modal" onClick={(e)=>{ if(e.target.classList.contains('modal')) onClose() }}>
      <div className="modal-card">
        <div className="modal-head">
          <h3>{initial?'공지사항 수정':'공지사항 작성'}</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label className="fg full">
            <span>제목 *</span>
            <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="제목을 입력하세요"/>
          </label>

          <div className="row">
            <label className="fg">
              <span>우선순위</span>
              <select value={form.priority} onChange={e=>set('priority',e.target.value)}>
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </label>
            <label className="fg">
              <span>카테고리</span>
              <select value={form.category} onChange={e=>set('category',e.target.value)}>
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
            <textarea value={form.content} onChange={e=>set('content',e.target.value)} placeholder="공지사항 내용을 입력하세요" rows={6}/>
          </label>

          <label className="fg full">
            <span>태그 (쉼표로 구분)</span>
            <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="예: 장학금, 모집, 긴급"/>
          </label>

          <div className="row">
            <label className="fg">
              <span>발행 일시</span>
              <input type="datetime-local" value={form.publishDate||''} onChange={e=>set('publishDate',e.target.value)}/>
            </label>
            <label className="fg">
              <span>만료 일시</span>
              <input type="datetime-local" value={form.expireDate||''} onChange={e=>set('expireDate',e.target.value)}/>
            </label>
          </div>

          <div className="checks">
            <label><input type="checkbox" checked={form.pin} onChange={e=>set('pin',e.target.checked)}/> 상단 고정</label>
            <label><input type="checkbox" checked={form.allowComments} onChange={e=>set('allowComments',e.target.checked)}/> 댓글 허용</label>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn primary" onClick={()=>onSave(payload)}>저장</button>
          <button className="btn primary" onClick={()=>onDraft(payload)}>임시저장</button>
          <button className="btn ghost" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  )
}

function toLocalDatetime(str){
  const d = new Date(str); d.setMinutes(d.getMinutes()-d.getTimezoneOffset())
  return d.toISOString().slice(0,16)
}
