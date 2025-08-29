import { useNavigate } from 'react-router-dom'

const h = {
  section:{ padding:'72px 0 40px' },
  title:{
    textAlign:'center', fontSize: '32px', lineHeight:1.35, fontWeight:800,
    letterSpacing:'-0.2px', color:'#3b3b3b', margin:'28px 0 18px'
  },
  ctaWrap:{display:'flex',justifyContent:'center'},
  cta:{
    background:'#7c95cc', color:'white', border:'none', borderRadius:9999,
    padding:'14px 22px', boxShadow:'0 8px 18px rgba(122,144,198,.35)',
    cursor:'pointer', fontWeight:700
  }
}

export default function Hero(){
  const navigate = useNavigate()
  
  const handleScholarshipClick = () => {
    navigate('/scholarships')
  }

  return (
    <section style={h.section}>
      <div className="container">
        <h1 style={h.title}>장학금을 더 간단하게 등록하고 싶다면?</h1>
        <div style={h.ctaWrap}>
          <button style={h.cta} onClick={handleScholarshipClick}>
            장학금 등록하러 가기&nbsp;➜
          </button>
        </div>
      </div>
    </section>
  )
}
