export default function StatCards({items=[]}){
  return (
    <div className="stat-wrap">
      {items.map(({label, value}, i)=>(
        <div className="stat" key={i}>
          <div className="v">{value}</div>
          <div className="l">{label}</div>
        </div>
      ))}
    </div>
  )
}
