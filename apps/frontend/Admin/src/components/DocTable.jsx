import Badge from './Badge'

function Files({list=[]}){
  return (
    <div className="files">
      {list.map((name,idx)=>(
        <div className="file" key={idx}>
          <span className="dot"/> {name}
        </div>
      ))}
    </div>
  )
}

function Row({r, onViewDetails}){
  return (
    <div className="trow" onClick={() => onViewDetails(r)} style={{cursor: 'pointer'}}>
      <div>
        <div className="cell-app">{r.applicant}</div>
        <div className="sub">{r.studentId}</div>
      </div>

      <div className="cell-title scholarship-wide">
        <div className="icon">📄</div>
        <div>
          <div className="title">{r.scholarship}</div>
          <div className="sub">{r.unit}</div>
        </div>
      </div>

      <Files list={r.files}/>

      <div className="cell-time">
        <div>{r.time.split(' ')[0]}</div>
        <div>{r.time.split(' ')[1]}</div>
      </div>

      <div className="act" style={{gap:8}} onClick={(e) => e.stopPropagation()}>
        <Badge status={r.status}/>
        {r.status === '검토 대기' && (
          <>
            <button className="approve-btn" onClick={r.onApprove}>승인</button>
            <button className="reject-btn" onClick={r.onReject}>반려</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function DocTable({rows=[], onViewDetails}){
  return (
    <section className="table">
      <div className="thead">
        <div>사용자</div>
        <div className="scholarship-header">장학금</div>
        <div>제출 서류</div>
        <div>제출 시간</div>
        <div style={{textAlign:'right'}}>상태</div>
      </div>

      {rows.map(r => <Row key={r.id} r={r} onViewDetails={onViewDetails}/>)}
    </section>
  )
}
