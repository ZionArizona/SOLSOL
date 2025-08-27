import { useState } from 'react'

export default function FilterBar({filters=[], onSearch=()=>{}, onReset=()=>{}, onCategoryChange=()=>{}, onStatusChange=()=>{}}){
  const [q, setQ] = useState('')
  
  return (
    <div className="filterbar">
      <div className="left">
        {filters.map((f,idx)=>{
          if(f.type==='checkbox'){
            return <label key={idx} className="fb-chip"><input type="checkbox" /> {f.label}</label>
          }
          if(f.type==='radio'){
            return <label key={idx} className="fb-chip"><input type="radio" name={f.name||'r'} defaultChecked={f.value}/> {f.label}</label>
          }
          if(f.type==='select'){
            if(f.label === '카테고리'){
              return (
                <select key={idx} className="fb-select" onChange={e=>onCategoryChange(e.target.value)}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )
            }
            if(f.label === '상태'){
              return (
                <select key={idx} className="fb-select" onChange={e=>onStatusChange(e.target.value)}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )
            }
            return (
              <select key={idx} className="fb-select">
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )
          }
          return null
        })}
      </div>

      <div className="right">
        <input
          className="fb-search"
          placeholder="장학명으로 검색…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button className="fb-btn" type="button" onClick={()=>onSearch(q)}>검색</button>
        <button className="fb-btn ghost" type="button" onClick={onReset}>초기화</button>
      </div>
    </div>
  )
}
