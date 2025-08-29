export default function FilterTabs({items=[], onTabChange}){
  return (
    <div className="tabs">
      {items.map(t=>(
        <div 
          key={t.key} 
          className={`tab ${t.active?'active':''}`}
          onClick={() => onTabChange && onTabChange(t.key)}
          style={{cursor: 'pointer'}}
        >
          {t.label}
        </div>
      ))}
    </div>
  )
}
