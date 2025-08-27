// src/pages/MyPage.jsx
import Navbar from '../components/Navbar'
import ProfileCard from '../components/ProfileCard'
import Switch from '../components/Switch'
import InfoRow from '../components/InfoRow'
import './mypage.css'

const MY_APPLIES = [
  { id:1, name:'우수학생 학업장려 장학금', status:'심사중', date:'2025-08-22' },
  { id:2, name:'저소득층 생계비 지원 장학금', status:'제출완료', date:'2025-08-18' },
]

export default function MyPage(){
  return (
    <>
      <Navbar/>
      <main className="my-wrap">
        <div className="my-container">
          {/* 좌측: 프로필 */}
          <aside className="my-left">
            <ProfileCard
              name="김솔쏠"
              email="sol@university.ac.kr"
              school="SSAFY University"
              role="학생"
            />
            <section className="card">
              <h3 className="card-title">계정</h3>
              <div className="btn-row">
                <button className="btn w">프로필 수정</button>
                <button className="btn w">비밀번호 변경</button>
              </div>
            </section>
          </aside>

          {/* 우측: 활동/설정 */}
          <section className="my-right">
            <div className="card">
              <h3 className="card-title">내 신청 내역</h3>
              <div className="list">
                {MY_APPLIES.map(v=>(
                  <InfoRow key={v.id}
                    left={<b>{v.name}</b>}
                    right={<span className={`badge ${v.status==='심사중'?'indigo':'blue'}`}>{v.status}</span>}
                    sub={`신청일 ${v.date}`}
                  />
                ))}
                {MY_APPLIES.length===0 && <div className="empty">신청 내역이 없습니다.</div>}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">알림 설정</h3>
              <div className="pref">
                <div className="pref-row">
                  <div>공지사항 알림</div>
                  <Switch defaultChecked/>
                </div>
                <div className="pref-row">
                  <div>장학금 등록/마감 알림</div>
                  <Switch defaultChecked/>
                </div>
                <div className="pref-row">
                  <div>이메일 알림</div>
                  <Switch/>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
