export default function CriteriaList({items=[]}) {
  if(!items.length) return <div className="empty">등록된 평가 항목이 없습니다.</div>;
  return (
    <div className="cri-list">
      {items.map((c,i)=>(
        <div className="cri" key={i}>
          <div className="name">{c.name}</div>
          <div className="meta">기준 {c.std} / 가중치 {c.weight}%</div>
        </div>
      ))}
    </div>
  );
}
