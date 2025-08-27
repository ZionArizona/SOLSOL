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

function Row({r}){
  return (
    <div className="trow">
      <div className="cell-title">
        <div className="icon">📄</div>
        <div>
          <div className="title">{r.scholarship}</div>
          <div className="sub">{r.unit}</div>
        </div>
      </div>

      <Files list={r.files}/>

      <div>
        <div className="cell-app">{r.applicant}</div>
        <div className="sub">{r.studentId}</div>
      </div>

      <div className="cell-time">
        <div>{r.time.split(' ')[0]}</div>
        <div>{r.time.split(' ')[1]}</div>
      </div>

      <div className="act" style={{gap:10}}>
        <Badge status={r.status}/>
        <button className="view-btn">보기</button>
      </div>
    </div>
  )
}

export default function DocTable({rows=[]}){
  return (
    <section className="table">
      <div className="thead">
        <div>장학금</div>
        <div>제출 서류</div>
        <div>신청자</div>
        <div>제출 시간</div>
        <div style={{textAlign:'right'}}>작업</div>
      </div>

      {rows.map(r => <Row key={r.id} r={r}/>)}
    </section>
  )
}
