export default function Toolbar({buttons=[]}){
  return (
    <div className="toolbar">
      {buttons.map((b,i)=>(
        <button
          key={i}
          className={`tool-btn ${b.tone==='primary'?'primary':''}`}
          type="button"
          onClick={b.onClick}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
