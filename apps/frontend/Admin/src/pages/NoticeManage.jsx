import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatCards from '../components/StatCards'
import Toolbar from '../components/Toolbar'
import NoticeFilters from '../components/NoticeFilters'
import NoticeCard from '../components/NoticeCard'
import NoticeModal from '../components/NoticeModal'
import { noticeApi } from '../lib/noticeStore'
import './notice-manage.css'

export default function NoticeManage(){
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status:'all', author:'all', q:'' })
  const [modal, setModal] = useState({ open:false, edit:null })

  // 데이터 로드
  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const data = await noticeApi.getNotices()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch notices:', error)
      alert('공지사항을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

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
      .filter(v => filters.author==='all' || (filters.author==='mine'? v.isMy : !v.isMy))
      .filter(v => !q || v.title.toLowerCase().includes(q) || v.content.toLowerCase().includes(q))
      .sort((a,b)=> new Date(b.created)-new Date(a.created))
  },[items,filters])

  // 액션 함수들

  const remove = async (id) => {
    if (confirm('이 공지사항을 삭제하시겠습니까?')) {
      try {
        await noticeApi.deleteNotice(id)
        await fetchNotices() // 데이터 새로고침
      } catch (error) {
        console.error('Failed to delete notice:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  const incView = async (id) => {
    try {
      await noticeApi.incrementViews(id)
      navigate(`/admin/notices/${id}`)
    } catch (error) {
      console.error('Failed to increment views:', error)
      navigate(`/admin/notices/${id}`)
    }
  }

  const openNew = () => setModal({open:true, edit:null})
  const openEdit = (id) => setModal({open:true, edit: items.find(v=>v.id===id) })
  const close = () => setModal({open:false, edit:null})

  const save = async (payload, mode='publish') => {
    try {
      const data = { ...payload, status: mode === 'draft' ? 'draft' : 'published' }
      
      if (modal.edit) {
        await noticeApi.updateNotice(modal.edit.id, data)
      } else {
        await noticeApi.createNotice(data)
      }
      
      await fetchNotices() // 데이터 새로고침
      close()
    } catch (error) {
      console.error('Failed to save notice:', error)
      alert('저장에 실패했습니다.')
    }
  }

  if(loading){
    return (
      <>
        <Navbar/>
        <div className="admin-layout">
          <Sidebar/>
          <main className="admin-main">
            <div className="empty">로딩 중...</div>
          </main>
        </div>
      </>
    )
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
              { label:'공지사항 작성', tone:'primary', onClick:openNew },
            ]}
          />

          {/* 통계 */}
          <StatCards items={stats}/>

          {/* 필터 & 검색 & 뷰토글 */}
          <NoticeFilters value={filters} onChange={setFilters}/>

          {/* 목록 - 리스트뷰만 사용 */}
          <section className="notice-grid list-view">
            {visible.length===0
              ? <div className="empty">작성된 공지사항이 없습니다.</div>
              : visible.map(v=>(
                  <NoticeCard
                    key={v.id}
                    data={v}
                    view="list"
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
