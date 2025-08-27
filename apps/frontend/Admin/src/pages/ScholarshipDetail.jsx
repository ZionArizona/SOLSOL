import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ProgressBar from '../components/ProgressBar'
import Section from '../components/Section'
import CriteriaList from '../components/CriteriaList'
import { scholarshipApi, scholarshipUtils } from '../lib/ScholarshipStore'
import './scholarship-detail.css'

export default function ScholarshipDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [criteria, setCriteria] = useState([])
  const [tags, setTags] = useState([])
  const [notices, setNotices] = useState([])

  useEffect(() => {
    fetchScholarshipDetail()
  }, [id])

  const fetchScholarshipDetail = async () => {
    try {
      const scholarship = await scholarshipApi.getScholarship(id)
      setData(scholarshipUtils.transformForFrontend(scholarship))
      
      // 추가 정보들도 함께 로드
      const [criteriaData, tagsData, noticesData] = await Promise.all([
        scholarshipApi.getCriteria(id),
        scholarshipApi.getTags(id),
        scholarshipApi.getNotices(id)
      ])
      
      setCriteria(criteriaData)
      setTags(tagsData)
      setNotices(noticesData)
    } catch (error) {
      console.error('Failed to fetch scholarship detail:', error)
      alert('장학금 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if(loading){
    return (
      <>
        <Navbar/>
        <div className="admin-layout"><Sidebar/><main className="admin-main"><div className="empty">로딩 중...</div></main></div>
      </>
    )
  }

  if(!data){
    return (
      <>
        <Navbar/>
        <div className="admin-layout"><Sidebar/><main className="admin-main"><div className="empty">장학금을 찾을 수 없습니다.</div></main></div>
      </>
    )
  }

  const tone = data.tag==='모집완룼' ? 'gray' : (data.tag==='모집예정' ? 'amber' : 'blue')
  
  const handleDelete = async () => {
    if(confirm('삭제할까요?')) {
      try {
        await scholarshipApi.deleteScholarship(id)
        alert('장학금이 삭제되었습니다.')
        nav('/admin/scholarships')
      } catch (error) {
        console.error('Failed to delete scholarship:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }
  
  const toggleStatus = async () => {
    const statusMap = {
      '모집중': 'CLOSED',
      '모집완료': 'DRAFT',
      '임시저장': 'OPEN'
    }
    
    const currentBackendStatus = Object.keys(statusMap).find(k => 
      scholarshipUtils.getStatusLabel(statusMap[k]) === data.tag
    )
    const nextStatus = statusMap[data.tag] || 'OPEN'
    
    try {
      const updated = await scholarshipApi.updateScholarship(id, { recruitmentStatus: nextStatus })
      setData(scholarshipUtils.transformForFrontend(updated))
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar/>
        <main className="admin-main">
          <div className="schd-head">
            <div>
              <div className={`mini-badge ${tone}`}>{data.tag}</div>
              <h1 className="schd-title">{data.title}</h1>
              <div className="meta">지급금액 {data.amount} · 선발 {data.picks}명 · 지원 {data.applied}명</div>
            </div>
            <div className="actions">
              <button className="btn ghost" onClick={()=>nav('/admin/scholarships')}>목록</button>
              <button className="btn" onClick={()=>nav(`/admin/scholarships/${id}/edit`)}>수정</button>
              <button className="btn" onClick={toggleStatus}>상태변경</button>
              <button className="btn danger" onClick={handleDelete}>삭제</button>
            </div>
          </div>

          {/* 개요 */}
          <section className="panel">
            <div className="overview">
              <div className="left">
                <div className="progress-row">
                  <div className="label">진행률</div>
                  <ProgressBar value={data.progress}/>
                  <div className="pct">{data.progress}%</div>
                </div>
                <div className="chips">
                  {data.chips?.map((c,i)=>(<span className="pill" key={i}>{c}</span>))}
                </div>
                <article className="desc">{data.desc}</article>
              </div>
              <div className="right">
                <dl className="kv">
                  <div><dt>장학금 종류</dt><dd>{data.type||'-'}</dd></div>
                  <div><dt>지급 방식</dt><dd>{data.payMethod||'-'}</dd></div>
                  <div><dt>모집 시작</dt><dd>{data.startDate||'-'}</dd></div>
                  <div><dt>모집 종료</dt><dd>{data.endDate||'-'}</dd></div>
                </dl>
              </div>
            </div>
          </section>

          {/* 신청 제한 조건 */}
          <Section title="신청 제한 조건">
            <dl className="kv">
              <div><dt>학년 제한</dt><dd>{data.constraints?.gradeLimit || '제한 없음'}</dd></div>
              <div><dt>전공 제한</dt><dd>{data.constraints?.majorLimit || '없음'}</dd></div>
              <div><dt>중복 수혜</dt><dd>{data.constraints?.duplicateAllowed ? '가능' : '불가'}</dd></div>
              <div><dt>최소 학점</dt><dd>{data.constraints?.minGpa || '-'}</dd></div>
            </dl>
            <div className="eligibility">지원 자격: {data.eligibility || '-'}</div>
            {data.categories?.length>0 && (
              <div className="chips">{data.categories.map((t,i)=><span className="pill" key={i}>{t}</span>)}</div>
            )}
          </Section>

          {/* 제출 서류 및 평가 기준 */}
          <Section title="제출 서류 및 평가 기준">
            <CriteriaList items={data.criteria}/>
            <div className="note">가중치 합계: <b>{(data.criteria||[]).reduce((s,c)=>s+Number(c.weight||0),0)}%</b></div>
          </Section>

          {/* 심사 관련 */}
          <Section title="심사 관련">
            <dl className="kv">
              <div><dt>심사 방식</dt><dd>{data.judge?.mode || '-'}</dd></div>
              <div><dt>면접 예정일</dt><dd>{data.judge?.interviewDate || '-'}</dd></div>
              <div><dt>심사 시작일</dt><dd>{data.judge?.judgeStart || '-'}</dd></div>
              <div><dt>결과 발표일</dt><dd>{data.judge?.resultDate || '-'}</dd></div>
            </dl>
          </Section>

          {/* 문의처 */}
          <Section title="문의처 정보">
            <dl className="kv">
              <div><dt>담당자</dt><dd>{data.contact?.manager || '-'}</dd></div>
              <div><dt>연락처</dt><dd>{data.contact?.phone || '-'}</dd></div>
              <div><dt>이메일</dt><dd>{data.contact?.email || '-'}</dd></div>
              <div><dt>사무실</dt><dd>{data.contact?.office || '-'}</dd></div>
            </dl>
            <div className="muted">{data.contact?.hours}</div>
          </Section>

          {/* 공지 */}
          <Section title="공지사항">
            <div className="notice-box">
              <div className="n-title">{data.notice?.title || '-'}</div>
              <div className="n-content">{data.notice?.content || ''}</div>
            </div>
          </Section>
        </main>
      </div>
    </>
  )
}
