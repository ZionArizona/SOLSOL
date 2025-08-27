export default function NoticeFilters({value, onChange}){
  const set = (k,v)=> onChange({...value, [k]:v})
  return (
    <div className="notice-filters">
      <div className="left">
        <label className="fg">
          <span>상태</span>
          <select value={value.status} onChange={e=>set('status', e.target.value)}>
            <option value="all">전체</option>
            <option value="published">게시됨</option>
            <option value="draft">임시저장</option>
            <option value="scheduled">예약발행</option>
          </select>
        </label>


        <label className="fg">
          <span>작성자</span>
          <select value={value.author} onChange={e=>set('author', e.target.value)}>
            <option value="all">전체</option>
            <option value="mine">내 공지사항</option>
            <option value="others">다른 관리자</option>
          </select>
        </label>
      </div>

      <div className="right">
        <input
          className="nf-search"
          placeholder="제목 또는 내용으로 검색…"
          value={value.q}
          onChange={e=>set('q', e.target.value)}
        />
      </div>
    </div>
  )
}
