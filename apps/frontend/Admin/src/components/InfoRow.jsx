// src/components/InfoRow.jsx
export default function InfoRow({left, right, sub}){
  return (
    <div className="ir">
      <div className="left">
        <div>{left}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  )
}
