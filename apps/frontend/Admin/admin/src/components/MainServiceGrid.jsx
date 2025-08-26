import Card from './MainCard'
import Mascot from './Mascot'

const box = {
  outer:{
    position:'relative',
    margin:'28px auto 80px',
    padding:'26px',
    borderRadius:'20px',
    background:'linear-gradient(180deg, rgba(255,255,255,.80), rgba(255,255,255,.55))',
    boxShadow:'var(--shadow-md)'
  },
  head:{
    textAlign:'center', marginBottom:'8px',
    letterSpacing:'2px', color:'#7a7a7a', fontWeight:800
  },
  desc:{textAlign:'center', color:'#1f9a43', fontWeight:700, fontSize:14, marginBottom:18},
  grid:{
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'18px',
    alignItems:'stretch',
    minHeight:'340px'
  },
  bottomLeft:{gridColumn:'1 / span 1'}
}

export default function ServiceGrid(){
  return (
    <section>
      <div className="container">
        <div style={box.outer}>
          <div style={{marginTop:10}}>
            <div style={box.head}>SERVICE</div>
            <p style={box.desc}>
              Hey Calendar의 서비스와 함께 빠르고 똑똑하게,<br/>
              신청부터 지급까지, 다 챙겨드려요.
            </p>
          </div>

          <div style={box.grid}>
            <Card title="제출 서류 반려/승인" body1="신청한 장학금"
                  body2="서류들을 한 눈에." linkTo="/admin/submissions"/>
            <Card title="장학금 관리" body1="진행 중인 장학금"
                  body2="목록을 한 눈에." linkTo="/admin/scholarships"/>
            <div style={box.bottomLeft}>
              <Card title="공지사항 관리" body1="장학금 관련"
                    body2="공지사항을 한 눈에." linkTo="/admin/announcements"/>
            </div>
            {/* 우하단 비워두고 마스코트 겹치기 */}
          </div>

          <Mascot/>
        </div>
      </div>
    </section>
  )
}
