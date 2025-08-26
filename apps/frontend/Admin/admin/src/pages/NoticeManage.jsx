import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import Toolbar from '../components/Toolbar'
import NoticeFilters from '../components/NoticeFilters'
import NoticeCard from '../components/NoticeCard'
import NoticeModal from '../components/NoticeModal'
import './notice-manage.css'

// 샘플 데이터(필요 시 API 연동으로 교체)
const initial = [
  { id:1, title:'긴급: 시스템 점검 안내', content:'학사 관리 시스템 점검으로 인해 일시적으로 서비스가 중단됩니다.',
    author:'최관리자', isMy:true, priority:'high', status:'published', category:'urgent',
    tags:['긴급','시스템점검'], publishDate:'2025-08-21T08:00:00', expireDate:'2025-08-21T18:00:00',
    views:234, comments:12, pin:true, allowComments:false, attach:false, created:'2025-08-21' },
  { id:2, title:'2025학년도 1학기 장학금 신청 안내', content:'2025학년도 1학기 장학금 신청이 시작됩니다. 기간 내에 신청 바랍니다.',
    author:'김교수', isMy:true, priority:'high', status:'published', category:'scholarship',
    tags:['장학금','신청','1학기'], publishDate:'2025-08-20T09:00:00', expireDate:'2025-09-15T23:59:59',
    views:156, comments:8, pin:true, allowComments:true, attach:true, created:'2025-08-20' },
  { id:3, title:'학사일정 변경 공지', content:'기말고사 일정이 변경되었습니다. 자세한 내용을 확인해주세요.',
    author:'이관리자', isMy:false, priority:'medium', status:'published', category:'academic',
    tags:['학사일정','기말고사'], publishDate:'2025-08-19T14:30:00', expireDate:null,
    views:89, comments:3, pin:false, allowComments:true, attach:false, created:'2025-08-19' },
  { id:4, title:'대학축제 부스 운영 안내', content:'다가오는 대학축제에서 부스를 운영할 동아리와 학과를 모집합니다.',
    author:'박교수', isMy:true, priority:'low', status:'draft', category:'event',
    tags:['축제','부스','모집'], publishDate:null, expireDate:'2025-10-31T23:59:59',
    views:0, comments:0, pin:false, allowComments:true, attach:true, created:'2025-08-18' },
  { id:5, title:'여름방학 도서관 이용시간 안내', content:'방학 기간 중 도서관 이용시간이 변경됩니다.',
    author:'정교수', isMy:true, priority:'medium', status:'scheduled', category:'general',
    tags:['도서관','이용시간','방학'], publishDate:'2025-08-25T10:00:00', expireDate:'2025-09-01T23:59:59',
    views:0, comments:0, pin:false, allowComments:true, attach:false, created:'2025-08-17' },
];

export default function NoticeManage(){
  const [items, setItems] = useState(initial)
  const [filters, setFilters] = useState({ status:'all', priority:'all', author:'all', q:'', view:'card' })
  const [modal, setModal] = useState({ open:false, edit:null })

  const stats = useMemo(()=>[
    { label:'전체 공지사항', value: items.length },
    { label:'내가 작성한 공지', value: items.filter(v=>v.isMy).length },
    { label:'게시 중', value: items.filter(v=>v.status==='published').length },
    { label:'총 조회수', value: items.reduce((s,v)=>s+v.views,0) },
  ],[items])

  const visible = useMemo(()=>{
    const q = filters.q.toLowerCase()
    return items
      .filter(v => filters.status==='all' || v.status===filters.status)
      .filter(v => filters.priority==='all' || v.priority===filters.priority)
      .filter(v => filters.author==='all' || (filters.author==='mine'? v.isMy : !v.isMy))
      .filter(v => !q || v.title.toLowerCase().includes(q) || v.content.toLowerCase().includes(q))
      .sort((a,b)=> (b.pin - a.pin) || (new Date(b.created)-new Date(a.created)))
  },[items,filters])

  const up = updater => setItems(prev => updater(prev.map(v=>({...v}))))

  // 카드 액션
  const togglePin = (id)=> up(list=>{
    const t = list.find(v=>v.id===id); if(t) t.pin = !t.pin; return list
  })
  const remove = (id)=> setItems(list => list.filter(v=>v.id!==id))
  const incView = (id)=> up(list=>{ const t=list.find(v=>v.id===id); if(t) t.views++; return list })
  const openNew = ()=> setModal({open:true, edit:null})
  const openEdit = (id)=> setModal({open:true, edit: items.find(v=>v.id===id) })
  const close = ()=> setModal({open:false, edit:null})

  const save = (payload, mode='publish')=>{
    if(modal.edit){
      setItems(list=> list.map(v=> v.id===modal.edit.id ? {...v, ...payload, status:mode==='draft'?'draft':'published'} : v))
    }else{
      const id = Math.max(0, ...items.map(v=>v.id)) + 1
      setItems(list=> [{ id, isMy:true, views:0, comments:0, pin:false, attach:false, created:new Date().toISOString().slice(0,10), ...payload, status:mode==='draft'?'draft':'published' }, ...list])
    }
    close()
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar/>

        <main className="admin-main">
          {/* 상단 버튼 */}
          <Toolbar
            buttons={[
              { label:'내보내기', onClick:()=>alert('엑셀 내보내기 샘플') },
              { label:'공지사항 작성', tone:'primary', onClick:openNew },
            ]}
          />

          {/* 통계 */}
          <StatCards items={stats}/>

          {/* 필터 & 검색 & 뷰토글 */}
          <NoticeFilters value={filters} onChange={setFilters}/>

          {/* 목록 */}
          <section className={`notice-grid ${filters.view==='list'?'list-view':''}`}>
            {visible.length===0
              ? <div className="empty">작성된 공지사항이 없습니다.</div>
              : visible.map(v=>(
                  <NoticeCard
                    key={v.id}
                    data={v}
                    view={filters.view}
                    onPin={()=>togglePin(v.id)}
                    onEdit={()=>openEdit(v.id)}
                    onDelete={()=>remove(v.id)}
                    onView={()=>incView(v.id)}
                  />
                ))
            }
          </section>
        </main>
      </div>

      {/* 작성/수정 모달 */}
      {modal.open && (
        <NoticeModal
          initial={modal.edit}
          onClose={close}
          onSave={(payload)=>save(payload,'publish')}
          onDraft={(payload)=>save(payload,'draft')}
        />
      )}
    </>
  )
}
