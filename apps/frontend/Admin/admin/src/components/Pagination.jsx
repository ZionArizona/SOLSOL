// src/components/Pagination.jsx
export default function Pagination({page=1, total=1, onChange=()=>{}}){
  if(total<=1) return null
  const goto = (p)=> onChange(Math.min(total, Math.max(1, p)))
  const nums = Array.from({length: total}, (_,i)=>i+1).slice(0,10) // 간단히 10페이지 제한
  return (
    <div className="pgn">
      <button onClick={()=>goto(page-1)} disabled={page===1}>이전</button>
      {nums.map(n=>(
        <button key={n} className={n===page?'act':''} onClick={()=>goto(n)}>{n}</button>
      ))}
      <button onClick={()=>goto(page+1)} disabled={page===total}>다음</button>
    </div>
  )
}
