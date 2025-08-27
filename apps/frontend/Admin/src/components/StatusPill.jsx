// src/components/StatusPill.jsx
export default function StatusPill({status}){
  const map = { published:'published', draft:'draft', scheduled:'scheduled' }
  const label = status==='published' ? '게시됨' : status==='draft' ? '임시저장' : '예약발행'
  return <span className={`status ${map[status]}`}>{label}</span>
}
