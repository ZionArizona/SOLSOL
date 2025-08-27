function Badge({tone, children}){
  return <span className={`badge ${tone}`}>{children}</span>
}
function Status({s}){
  const map={ published:'published', draft:'draft', scheduled:'scheduled' }
  return <span className={`status ${map[s]}`}>{s==='published'?'게시됨':s==='draft'?'임시저장':'예약발행'}</span>
}

export default function NoticeCard({data, view='card', onEdit, onDelete, onView}){
  const time = (data.publishDate || data.created)
  const tstr = new Date(time).toLocaleString('ko-KR', {hour:'2-digit', minute:'2-digit', year:'numeric', month:'2-digit', day:'2-digit'})

  return (
    <article className={`notice-card ${view==='list'?'list-view':''}`}>
      {data.isMy && <span className="owner">내 작성</span>}

      {view==='card' ? (
        <>
          <div className="card-head">
            <div className="title">{data.title}</div>
            <div className="meta">
              <span>✍ {data.author}</span>
              <span>📅 {tstr}</span>
              <Status s={data.status}/>
            </div>
          </div>

          <div className="content">{data.content}</div>

          {data.tags?.length>0 && (
            <div className="tags">{data.tags.map((t,i)=><span className="tag" key={i}>#{t}</span>)}</div>
          )}

          <div className="meta foot">
            {data.attach && <span>📎</span>}
          </div>
        </>
      ) : (
        <div className="list-body">
          <div className="title">{data.title}</div>
          <div className="meta">
            <span>✍ {data.author}</span>
            <span>📅 {tstr}</span>
            <Status s={data.status}/>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn view" onClick={() => onView(data.id)}>상세보기</button>
        {data.isMy && (
          <>
            <button className="btn edit" onClick={onEdit}>수정</button>
            <button className="btn del" onClick={onDelete}>삭제</button>
          </>
        )}
      </div>
    </article>
  )
}
