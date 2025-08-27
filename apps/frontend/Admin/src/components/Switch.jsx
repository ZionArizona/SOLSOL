// src/components/Switch.jsx
import { useState } from 'react'
export default function Switch({defaultChecked=false, onChange=()=>{}}){
  const [on, setOn] = useState(defaultChecked)
  const toggle = ()=>{ setOn(v=>!v); onChange(!on) }
  return (
    <button type="button" className={`sw ${on?'on':''}`} onClick={toggle} aria-pressed={on}/>
  )
}
