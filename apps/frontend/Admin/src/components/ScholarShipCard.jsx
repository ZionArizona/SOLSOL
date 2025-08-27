import ProgressBar from './ProgressBar'

function MiniBadge({tone='blue', children}){
  return <span className={`mini-badge ${tone}`}>{children}</span>
}
function Pill({children}){ return <span className="pill">{children}</span> }

export default function ScholarshipCard({data}){
  const tone = data.tag==='모집완료' ? 'gray' : (data.tag==='모집예정' ? 'amber' : 'blue')

  return (
    <article className="sch-card">
      <div className="sch-head">
        <MiniBadge tone={tone}>{data.tag}</MiniBadge>
        <h3 className="sch-title">{data.title}</h3>
      </div>

      <div className="sch-body">
        <dl className="kv">
          <div><dt>지급금액</dt><dd>{data.amount}</dd></div>
          <div><dt>선발인원</dt><dd>{data.picks}</dd></div>
          <div><dt>지원수</dt><dd>{data.applied}</dd></div>
          <div><dt>상태</dt><dd><MiniBadge tone="indigo">{data.status}</MiniBadge></dd></div>
        </dl>

        <div className="progress">
          <div className="label">진행률</div>
          <ProgressBar value={data.progress}/>
          <div className="pct">{data.progress}%</div>
        </div>

        <div className="method">심사방식: {data.method}</div>

        <div className="chip-row">
          {data.chips.map((c,i)=><Pill key={i}>{c}</Pill>)}
        </div>
      </div>

      <div className="sch-foot">
        <button className="card-btn">상세보기</button>
        <button className="card-btn">지원자 보기</button>
        <button className="card-btn ghost">복사</button>
        <button className="card-btn danger">삭제</button>
      </div>
    </article>
  )
}
