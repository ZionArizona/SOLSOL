import { Link } from 'react-router-dom'

const cardStyle={
  wrap:{
    background:'var(--glass)',
    border:'1px solid rgba(255,255,255,.65)',
    backdropFilter:'blur(10px)',
    borderRadius:'18px',
    padding:'26px 22px',
    minHeight:'120px',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    boxShadow:'0 10px 20px rgba(116,130,170,.15)',
    textDecoration:'none',
    color:'inherit',
    cursor:'pointer',
    transition:'all 0.2s ease'
  },
  title:{fontWeight:800, color:'#3b3b3b', marginBottom:10},
  body:{color:'#9aa0a6', fontSize:14, lineHeight:1.35}
}

export default function Card({title, body1, body2, linkTo}){
  const CardContent = () => (
    <>
      <div style={cardStyle.title}>{title}</div>
      <div style={cardStyle.body}>
        {body1}<br/>{body2}
      </div>
    </>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} style={cardStyle.wrap}>
        <CardContent />
      </Link>
    )
  }

  return (
    <div style={cardStyle.wrap}>
      <CardContent />
    </div>
  )
}
