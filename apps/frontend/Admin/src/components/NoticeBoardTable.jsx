function isNew(dateStr){
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / (1000*60*60*24)
  return diff <= 7   // 최근 7일 NEW
}

export default function NoticeBoardTable({rows=[], onRowClick=()=>{}}){
  return (
    <section className="board-card">
      <table className="board">
        <colgroup>
          <col style={{width:'120px'}} />
          <col />
          <col style={{width:'140px'}} />
          <col style={{width:'100px'}} />
        </colgroup>
        <thead>
          <tr>
            <th>구분</th>
            <th>제목</th>
            <th>작성일</th>
            <th>조회</th>
          </tr>
        </thead>
        <tbody>
          {rows.length===0 && (
            <tr className="empty"><td colSpan={4}>검색 결과가 없습니다.</td></tr>
          )}
          {rows.map(r=>(
            <tr key={r.id} className="row" onClick={()=>onRowClick(r.id)}>
              <td><span className="cat">{r.category}</span></td>
              <td className="title-cell">
                <span className="title">{r.title}</span>
                {r.tag && <span className="pill">#{r.tag}</span>}
                {r.attach && <span className="clip" title="첨부파일">📎</span>}
                {isNew(r.date) && <span className="new">NEW</span>}
              </td>
              <td>{r.date}</td>
              <td>{r.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
