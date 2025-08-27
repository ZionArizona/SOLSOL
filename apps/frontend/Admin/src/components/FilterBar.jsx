import { useState } from 'react'

export default function FilterBar({filters=[], onSearch=()=>{}, onReset=()=>{}}){
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
            return (
              <select key={idx} className="fb-select">
                {f.options.map(o => <option key={o}>{o}</option>)}
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
