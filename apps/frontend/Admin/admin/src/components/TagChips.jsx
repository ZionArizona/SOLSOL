// src/components/TagChips.jsx
export default function TagChips({tags=[]}){
  if(!tags.length) return null
  return (
    <div className="tags">
      {tags.map((t,i)=> <span className="tag" key={i}>#{t}</span>)}
    </div>
  )
}
