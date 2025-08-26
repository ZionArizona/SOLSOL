export default function FilterTabs({items=[]}){
  return (
    <div className="tabs">
      {items.map(t=>(
        <div key={t.key} className={`tab ${t.active?'active':''}`}>{t.label}</div>
      ))}
    </div>
  )
}
