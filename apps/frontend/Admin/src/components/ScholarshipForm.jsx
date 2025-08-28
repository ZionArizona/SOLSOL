import { useEffect, useMemo, useState } from 'react'
import Section from './Section'

export default function ScholarshipForm({initial, onSubmit, submitText='저장'}){
  const [form, setForm] = useState({
    title:'', type:'', amount:'', picks:'', payMethod:'일시지급',
    startDate:'', endDate:'', eligibility:'', desc:'', categories:'',
    constraints:{ gradeLimit:'제한 없음', majorLimit:'', duplicateAllowed:true, minGpa:'' },
    criteria:[], judge:{ mode:'서류심사', interviewDate:'', judgeStart:'', resultDate:'' },
    contact:{ manager:'', phone:'', email:'', office:'', hours:'' },
    notice:{ title:'', content:'' },
    tag:'모집중', chips:''
  })

  const [cri, setCri] = useState({ name:'', std:'', weight:'' })
  const totalWeight = useMemo(()=> form.criteria.reduce((s,c)=>s+Number(c.weight||0),0), [form.criteria])
  const set = (k,v)=> setForm(prev => ({...prev, [k]:v}))
  const setPath = (path, v)=>{
    const copy = {...form}; const keys = path.split('.')
    let cur = copy; for(let i=0;i<keys.length-1;i++) cur = cur[keys[i]]
    cur[keys[keys.length-1]] = v; setForm(copy)
  }

  useEffect(()=>{
    if(initial){
      setForm({
        ...form,
        ...initial,
        picks: String(initial.picks ?? ''),
        categories: Array.isArray(initial.categories) ? initial.categories.join(', ') : (initial.categories || ''),
        chips: Array.isArray(initial.chips) ? initial.chips.join(', ') : (initial.chips || '')
      })
    }
    // eslint-disable-next-line
  }, [initial])

  const addCri = ()=>{
    if(!cri.name.trim()) return
    setForm(f=>({...f, criteria:[...f.criteria, {name:cri.name.trim(), std:cri.std||'-', weight:cri.weight||0}]}))
    setCri({name:'', std:'', weight:''})
  }
  const removeCri = (i)=> setForm(f=>({...f, criteria:f.criteria.filter((_,idx)=>idx!==i)}))

  const submit = (e)=>{
    e.preventDefault()
    const payload = {
      ...form,
      picks: parseInt(typeof form.picks === 'string' ? form.picks.replace(/[^0-9]/g, '') : form.picks) || 1,
      categories: form.categories.split(',').map(s=>s.trim()).filter(Boolean),
      chips: form.chips.split(',').map(s=>s.trim()).filter(Boolean),
      progress: initial?.progress ?? 0,
      applied: initial?.applied ?? 0,
      amount: form.amount || initial?.amount || '',
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="form-panel">
      <div className="page-title">장학금 {initial?'수정':'등록'}</div>

      <Section title="기본 정보">
        <div className="grid-2">
          <div className="field">
            <label className="label">장학금명 *</label>
            <input className="ip" value={form.title} onChange={e=>set('title', e.target.value)} placeholder="장학명을 입력하세요"/>
          </div>
          <div className="field">
            <label className="label">장학금 지급 금액 *</label>
            <input className="ip" value={form.amount} onChange={e=>set('amount', e.target.value)} placeholder="금액 (마일리지)"/>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="label">장학금 종류 *</label>
            <select className="ip" value={form.type} onChange={e=>set('type', e.target.value)}>
              <option value="">선택하세요</option><option>성적우수</option><option>생활지원</option><option>공로/활동</option><option>기타</option>
            </select>
          </div>
          <div className="field">
            <label className="label">선발 인원 *</label>
            <input className="ip" value={form.picks} onChange={e=>set('picks', e.target.value)} placeholder="예: 10"/>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="label">지급 방식 *</label>
            <div className="radios">
              <label><input type="radio" name="pay" checked={form.payMethod==='일시지급'} onChange={()=>set('payMethod','일시지급')}/> 일시지급</label>
              <label><input type="radio" name="pay" checked={form.payMethod==='분할지급'} onChange={()=>set('payMethod','분할지급')}/> 분할지급</label>
            </div>
          </div>
          <div className="field">
            <label className="label">키워드(카드 칩)</label>
            <input className="ip" value={form.chips} onChange={e=>set('chips', e.target.value)} placeholder="쉼표로 구분 (예: 성적우수, 복지)"/>
          </div>
        </div>

        <div className="grid-2">
          <div className="field"><label className="label">모집 시작일</label><input className="ip" type="date" value={form.startDate} onChange={e=>set('startDate', e.target.value)}/></div>
          <div className="field"><label className="label">모집 종료일 *</label><input className="ip" type="date" value={form.endDate} onChange={e=>set('endDate', e.target.value)}/></div>
        </div>

        <div className="field"><label className="label">지원 자격 조건 *</label><input className="ip" value={form.eligibility} onChange={e=>set('eligibility', e.target.value)} placeholder="지원 자격 조건을 입력하세요"/></div>
        <div className="field"><label className="label">장학금 상세 설명</label><textarea className="ta" rows={4} value={form.desc} onChange={e=>set('desc', e.target.value)} placeholder="상세 설명"/></div>
        <div className="field"><label className="label">장학금 카테고리/태그 *</label><input className="ip" value={form.categories} onChange={e=>set('categories', e.target.value)} placeholder="쉼표로 구분"/></div>
      </Section>

      <Section title="신청 제한 조건">
        <div className="grid-2">
          <div className="field"><label className="label">학년 제한</label>
            <select className="ip" value={form.constraints.gradeLimit} onChange={e=>setPath('constraints.gradeLimit', e.target.value)}>
              <option>제한 없음</option><option>1학년 이상</option><option>2학년 이상</option><option>3학년 이상</option><option>4학년만</option>
            </select>
          </div>
          <div className="field"><label className="label">전공 제한</label>
            <input className="ip" value={form.constraints.majorLimit} onChange={e=>setPath('constraints.majorLimit', e.target.value)} placeholder="없으면 비워두세요"/>
          </div>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">중복 수혜 제한</label>
            <div className="radios">
              <label><input type="radio" checked={form.constraints.duplicateAllowed} onChange={()=>setPath('constraints.duplicateAllowed', true)}/> 가능</label>
              <label><input type="radio" checked={!form.constraints.duplicateAllowed} onChange={()=>setPath('constraints.duplicateAllowed', false)}/> 불가</label>
            </div>
          </div>
          <div className="field"><label className="label">최소 학점 조건</label>
            <input className="ip" value={form.constraints.minGpa} onChange={e=>setPath('constraints.minGpa', e.target.value)} placeholder="예: 3.0"/>
          </div>
        </div>
      </Section>

      <Section title="제출 서류 및 평가 기준">
        <div className="criteria-row">
          <input className="ip flex1" placeholder="항목명" value={cri.name} onChange={e=>setCri({...cri, name:e.target.value})}/>
          <input className="ip w120" placeholder="기준" value={cri.std} onChange={e=>setCri({...cri, std:e.target.value})}/>
          <div className="w120 with-suffix">
            <input className="ip" placeholder="가중치" value={cri.weight} onChange={e=>setCri({...cri, weight:e.target.value})}/>
            <span className="suffix">%</span>
          </div>
          <button type="button" className="btn-add" onClick={addCri}>추가</button>
        </div>

        <div className="criteria-list">
          {form.criteria.length===0 && <div className="empty">추가된 항목이 없습니다.</div>}
          {form.criteria.map((c,idx)=>(
            <div className="chip" key={idx}>
              <span className="name">{c.name}</span>
              <span className="meta">기준 {c.std} / 가중치 {c.weight}%</span>
              <button type="button" className="del" onClick={()=>removeCri(idx)}>삭제</button>
            </div>
          ))}
        </div>
        <div className={`weight-note ${totalWeight===100?'ok':''}`}>가중치 합계: <b>{totalWeight}%</b> {totalWeight===100?'(OK)':'(100% 권장)'}</div>
      </Section>

      <Section title="심사 관련">
        <div className="grid-2">
          <div className="field"><label className="label">심사 방식 *</label>
            <div className="radios">
              <label><input type="radio" checked={form.judge.mode==='서류심사'} onChange={()=>setPath('judge.mode','서류심사')}/> 서류심사</label>
              <label><input type="radio" checked={form.judge.mode==='서류 + 면접'} onChange={()=>setPath('judge.mode','서류 + 면접')}/> 서류 + 면접</label>
            </div>
          </div>
          <div className="field"><label className="label">면접 예정일</label><input className="ip" type="date" value={form.judge.interviewDate} onChange={e=>setPath('judge.interviewDate', e.target.value)}/></div>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">심사 시작일 *</label><input className="ip" type="date" value={form.judge.judgeStart} onChange={e=>setPath('judge.judgeStart', e.target.value)}/></div>
          <div className="field"><label className="label">결과 발표일 *</label><input className="ip" type="date" value={form.judge.resultDate} onChange={e=>setPath('judge.resultDate', e.target.value)}/></div>
        </div>
      </Section>

      <Section title="문의처 정보">
        <div className="grid-2">
          <div className="field"><label className="label">담당자명 *</label><input className="ip" value={form.contact.manager} onChange={e=>setPath('contact.manager', e.target.value)}/></div>
          <div className="field"><label className="label">연락처 *</label><input className="ip" value={form.contact.phone} onChange={e=>setPath('contact.phone', e.target.value)}/></div>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">이메일 *</label><input className="ip" value={form.contact.email} onChange={e=>setPath('contact.email', e.target.value)}/></div>
          <div className="field"><label className="label">사무실 위치</label><input className="ip" value={form.contact.office} onChange={e=>setPath('contact.office', e.target.value)}/></div>
        </div>
        <div className="field"><label className="label">상담 가능 시간</label><input className="ip" value={form.contact.hours} onChange={e=>setPath('contact.hours', e.target.value)} placeholder="예: 평일 09:00~18:00"/></div>
      </Section>

      <Section title="공지사항">
        <div className="field"><label className="label">공지사항 제목 *</label><input className="ip" value={form.notice.title} onChange={e=>setPath('notice.title', e.target.value)}/></div>
        <div className="field"><label className="label">공지사항 내용 *</label><textarea className="ta" rows={5} value={form.notice.content} onChange={e=>setPath('notice.content', e.target.value)}/></div>
      </Section>

      <div className="submit-row"><button className="btn-primary" type="submit">{submitText}</button></div>
    </form>
  )
}
