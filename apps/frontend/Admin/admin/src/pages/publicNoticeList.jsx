import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import NoticeBoardTable from '../components/NoticeBoardTable'
import Pagination from '../components/Pagination'
import './public-notice.css'

const MOCK = [
  { id:1, category:'공지',  title:'긴급: 시스템 점검 안내',   date:'2025-08-21', views:234, attach:true,  tag:'긴급' },
  { id:2, category:'장학금', title:'2025-1학기 장학금 신청 안내', date:'2025-08-20', views:156, attach:false, tag:'안내' },
  { id:3, category:'학사',  title:'학사일정 변경 공지',        date:'2025-08-19', views:89,  attach:false, tag:'변경' },
  { id:4, category:'행사',  title:'대학축제 부스 운영 안내',    date:'2025-08-18', views:61,  attach:true,  tag:'모집' },
  { id:5, category:'일반',  title:'도서관 이용시간 안내(방학)',  date:'2025-08-17', views:40,  attach:false, tag:'안내' },
  { id:6, category:'학사',  title:'수강변경 기간 공지',        date:'2025-08-16', views:120, attach:false, tag:'안내' },
]

export default function PublicNoticeList(){
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('전체')
  const [sort, setSort] = useState('최신순')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(()=>{
    let list = [...MOCK]
    if (cat !== '전체') list = list.filter(v => v.category === cat)
    if (q.trim()) list = list.filter(v => v.title.toLowerCase().includes(q.toLowerCase()))
    if (sort === '최신순') list.sort((a,b)=> new Date(b.date) - new Date(a.date))
    if (sort === '조회순') list.sort((a,b)=> b.views - a.views)
    return list
  }, [q, cat, sort])

  const total = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows  = filtered.slice((page-1)*pageSize, page*pageSize)

  const onRowClick = (id)=> {
    // 필요하면 라우팅 연동
    // navigate(`/notices/${id}`)
    console.log('공지 상세로 이동:', id)
  }

  return (
    <>
      <Navbar/>
      <main className="notice-wrap">
        <div className="notice-head">
          <h1>공지사항</h1>
          <div className="filters">
            <select value={cat} onChange={e=>{setCat(e.target.value); setPage(1)}}>
              <option>전체</option><option>공지</option><option>장학금</option>
              <option>학사</option><option>행사</option><option>일반</option>
            </select>
            <select value={sort} onChange={e=>{setSort(e.target.value); setPage(1)}}>
              <option>최신순</option>
              <option>조회순</option>
            </select>
            <input
              placeholder="제목 검색…"
              value={q}
              onChange={e=>{setQ(e.target.value); setPage(1)}}
            />
            <button className="btn">검색</button>
          </div>
        </div>

        <NoticeBoardTable rows={rows} onRowClick={onRowClick}/>
        <Pagination page={page} total={total} onChange={setPage}/>
      </main>
    </>
  )
}
