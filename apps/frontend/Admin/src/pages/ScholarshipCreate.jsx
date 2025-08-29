import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { scholarshipApi, scholarshipUtils } from '../lib/ScholarshipStore'
import './scholarship-create.css'

export default function ScholarshipCreate(){
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  // 필수 필드들에 대한 ref 생성
  const scholarshipNameRef = useRef()
  const amountRef = useRef()
  const typeRef = useRef()
  const recruitmentEndDateRef = useRef()
  const evaluationStartDateRef = useRef()
  const resultAnnouncementDateRef = useRef()
  const eligibilityConditionRef = useRef()
  const contactPersonNameRef = useRef()
  const contactPhoneRef = useRef()
  const contactEmailRef = useRef()
  
  // 기본 정보
  const [formData, setFormData] = useState({
    scholarshipName: '',
    amount: '',
    type: '',
    numberOfRecipients: '',
    paymentMethod: 'LUMP_SUM',
    recruitmentStartDate: new Date().toISOString().split('T')[0],
    recruitmentEndDate: '',
    eligibilityCondition: '',
    description: '',
    category: '',
    gradeRestriction: '',
    majorRestriction: '',
    duplicateAllowed: true,
    minGpa: '',
    evaluationMethod: 'DOCUMENT_REVIEW',
    interviewDate: '',
    evaluationStartDate: '',
    resultAnnouncementDate: '',
    contactPersonName: '',
    contactPhone: '010-0000-0000',
    contactEmail: '',
  })

  // 제출서류 동적 리스트
  const [reqName, setReqName] = useState('')
  const [criteria, setCriteria] = useState([])
  
  // 제출서류
  const [docName, setDocName] = useState('')
  const [docKeywords, setDocKeywords] = useState('')
  const [docRequired, setDocRequired] = useState(true)
  const [requiredDocuments, setRequiredDocuments] = useState([])


  // 컴포넌트 마운트 시 카테고리 목록 로드 및 사용자 정보 설정
  useEffect(() => {
    loadCategories()
    
    // 로그인된 사용자 정보 가져오기
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setFormData(prev => ({
        ...prev,
        contactPersonName: user.userNm || user.userName || '',
        contactEmail: user.userId || ''
      }))
    }
  }, [])

  const loadCategories = async () => {
    try {
      const categoryList = await scholarshipApi.getCategories()
      setCategories(categoryList)
    } catch (error) {
      console.error('카테고리 로드 실패:', error)
    }
  }

  const addCriteria = () => {
    if(!reqName.trim()) return
    setCriteria(list => [...list, {
      name: reqName.trim(),
      weight: 0 // 가중치는 0으로 고정 (백엔드 필드명에 맞춤)
    }])
    setReqName('')
  }
  const removeCriteria = (idx) => {
    setCriteria(list => list.filter((_,i)=> i!==idx))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // 필수 필드 검증 및 포커스
    const requiredFields = [
      { value: formData.scholarshipName, ref: scholarshipNameRef, name: '장학금명' },
      { value: formData.amount, ref: amountRef, name: '마일리지 지급 금액' },
      { value: formData.type, ref: typeRef, name: '장학금 종류' },
      { value: formData.recruitmentEndDate, ref: recruitmentEndDateRef, name: '모집 종료일' },
      { value: formData.evaluationStartDate, ref: evaluationStartDateRef, name: '심사 시작일' },
      { value: formData.resultAnnouncementDate, ref: resultAnnouncementDateRef, name: '결과 발표일' },
      { value: formData.eligibilityCondition, ref: eligibilityConditionRef, name: '지원 자격 조건' },
      { value: formData.contactPersonName, ref: contactPersonNameRef, name: '관리자명' },
      { value: formData.contactPhone, ref: contactPhoneRef, name: '연락처' },
      { value: formData.contactEmail, ref: contactEmailRef, name: '이메일' }
    ]
    
    const missingField = requiredFields.find(field => !field.value || field.value.trim() === '')
    if (missingField) {
      alert(`필수 항목을 입력해주세요: ${missingField.name}`)
      if (missingField.ref && missingField.ref.current) {
        missingField.ref.current.focus()
        missingField.ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsLoading(true)
    
    try {
      // criteria를 requiredDocuments로 변환
      console.log('📋 Current criteria before transform:', criteria);
      const requiredDocuments = criteria.map(c => ({
        name: c.name,
        keywords: [c.name.toLowerCase()],
        required: true
      }))
      console.log('📋 Required documents:', requiredDocuments);

      const scholarshipData = scholarshipUtils.transformForBackend({
        ...formData,
        criteria,
        requiredDocuments,
        recruitmentStatus: 'OPEN'
      })
      console.log('📋 Final scholarship data being sent:', scholarshipData);

      const result = await scholarshipApi.createScholarship(scholarshipData)
      
      if (result) {
        alert('장학금이 성공적으로 등록되었습니다.')
        navigate('/admin/scholarships')
      }
    } catch (error) {
      console.error('Failed to create scholarship:', error)
      alert('장학금 등록에 실패했습니다: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar/>
      <div className="admin-layout">
        <Sidebar/>

        <main className="admin-main">
          <form className="form-panel" onSubmit={onSubmit}>

            {/* 타이틀 */}
            <div className="page-title">장학금 등록하기 <span className="req">*</span></div>

            {/* ===== 기본 정보 ===== */}
            <Section title="기본 정보">
              <Grid2>
                <Field label="장학금명 *">
                  <input 
                    ref={scholarshipNameRef}
                    className="ip" 
                    placeholder="장학명을 입력하세요"
                    value={formData.scholarshipName}
                    onChange={(e) => handleInputChange('scholarshipName', e.target.value)}
                  />
                </Field>
                <Field label="마일리지 지급 금액 *">
                  <input 
                    ref={amountRef}
                    className="ip" 
                    type="number"
                    placeholder="금액을 입력하세요 (마일리지)"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="장학금 종류 *">
                  <select 
                    ref={typeRef}
                    className="ip"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="ACADEMIC">성적우수</option>
                    <option value="FINANCIAL_AID">생활지원</option>
                    <option value="ACTIVITY">공로/활동</option>
                    <option value="OTHER">기타</option>
                  </select>
                </Field>
                <Field label="선발 인원">
                  <input 
                    className="ip" 
                    type="number"
                    placeholder="선발 인원을 입력하세요 (빈 값 가능)"
                    value={formData.numberOfRecipients}
                    onChange={(e) => handleInputChange('numberOfRecipients', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="지급 방식 *">
                  <div className="radios">
                    <label>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="LUMP_SUM"
                        checked={formData.paymentMethod === 'LUMP_SUM'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      /> 일시지급
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="INSTALLMENT"
                        checked={formData.paymentMethod === 'INSTALLMENT'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      /> 분할지급
                    </label>
                  </div>
                </Field>
                <div/>
              </Grid2>

              <Grid2>
                <Field label="모집 시작일">
                  <input 
                    className="ip" 
                    type="date"
                    value={formData.recruitmentStartDate}
                    onChange={(e) => handleInputChange('recruitmentStartDate', e.target.value)}
                  />
                </Field>
                <Field label="모집 종료일 *">
                  <input 
                    ref={recruitmentEndDateRef}
                    className="ip" 
                    type="date"
                    value={formData.recruitmentEndDate}
                    onChange={(e) => handleInputChange('recruitmentEndDate', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Field label="지원 자격 조건 *">
                <input 
                  ref={eligibilityConditionRef}
                  className="ip" 
                  placeholder="지원 자격 조건을 입력하세요"
                  value={formData.eligibilityCondition}
                  onChange={(e) => handleInputChange('eligibilityCondition', e.target.value)}
                />
              </Field>

              <Field label="장학금 상세 설명">
                <textarea 
                  className="ta" 
                  rows={4} 
                  placeholder="장학금에 대한 상세한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Field>

            </Section>

            {/* ===== 신청 제한 조건 ===== */}
            <Section title="신청 제한 조건">
              <Grid2>
                <Field label="학년 제한">
                  <select 
                    className="ip"
                    value={formData.gradeRestriction}
                    onChange={(e) => handleInputChange('gradeRestriction', e.target.value)}
                  >
                    <option value="">제한 없음</option>
                    <option value="1학년 이상">1학년 이상</option>
                    <option value="2학년 이상">2학년 이상</option>
                    <option value="3학년 이상">3학년 이상</option>
                    <option value="4학년만">4학년만</option>
                  </select>
                </Field>
                <Field label="전공 제한">
                  <input 
                    className="ip" 
                    placeholder="예: 컴퓨터공학과, 경영학과 (제한 없으면 비워두세요)"
                    value={formData.majorRestriction}
                    onChange={(e) => handleInputChange('majorRestriction', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="중복 수혜 제한">
                  <div className="radios">
                    <label>
                      <input 
                        type="radio" 
                        name="dup" 
                        value="true"
                        checked={formData.duplicateAllowed === true}
                        onChange={(e) => handleInputChange('duplicateAllowed', e.target.value === 'true')}
                      /> 중복 수혜 가능
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="dup" 
                        value="false"
                        checked={formData.duplicateAllowed === false}
                        onChange={(e) => handleInputChange('duplicateAllowed', e.target.value === 'true')}
                      /> 중복 수혜 불가
                    </label>
                  </div>
                </Field>
                <Field label="최소 학점 조건">
                  <input 
                    className="ip" 
                    placeholder="예: 3.0 (제한 없으면 비워두세요)"
                    value={formData.minGpa}
                    onChange={(e) => handleInputChange('minGpa', e.target.value)}
                  />
                </Field>
              </Grid2>
            </Section>

            {/* ===== 제출 서류 ===== */}
            <Section title="제출 서류">
              <div className="criteria-row">
                <input className="ip flex1" placeholder="서류명을 입력하세요 (예: 성적증명서, 자기소개서)"
                       value={reqName} onChange={e=>setReqName(e.target.value)} />
                <button type="button" className="btn-add" onClick={addCriteria}>추가</button>
              </div>

              <div className="criteria-list">
                {criteria.length===0 && <div className="empty">추가된 서류가 없습니다.</div>}
                {criteria.map((c,idx)=>(
                  <div className="chip" key={idx}>
                    <span className="name">{c.name}</span>
                    <button type="button" className="del" onClick={()=>removeCriteria(idx)}>삭제</button>
                  </div>
                ))}
              </div>
            </Section>

            {/* ===== 심사 관련 ===== */}
            <Section title="심사 관련">
              <Field label="심사 방식 *">
                <div className="radios">
                  <label>
                    <input 
                      type="radio" 
                      name="judge" 
                      value="DOCUMENT_REVIEW"
                      checked={formData.evaluationMethod === 'DOCUMENT_REVIEW'}
                      onChange={(e) => handleInputChange('evaluationMethod', e.target.value)}
                    /> 서류심사
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="judge" 
                      value="DOCUMENT_INTERVIEW"
                      checked={formData.evaluationMethod === 'DOCUMENT_INTERVIEW'}
                      onChange={(e) => handleInputChange('evaluationMethod', e.target.value)}
                    /> 서류심사 + 면접심사
                  </label>
                </div>
              </Field>

              <Grid2>
                <Field label="심사 시작일 *">
                  <input 
                    ref={evaluationStartDateRef}
                    className="ip" 
                    type="date"
                    value={formData.evaluationStartDate}
                    onChange={(e) => handleInputChange('evaluationStartDate', e.target.value)}
                  />
                </Field>
                <Field label="결과 발표일 *">
                  <input 
                    ref={resultAnnouncementDateRef}
                    className="ip" 
                    type="date"
                    value={formData.resultAnnouncementDate}
                    onChange={(e) => handleInputChange('resultAnnouncementDate', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Field label="면접 예정일">
                <input 
                  className="ip" 
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => handleInputChange('interviewDate', e.target.value)}
                />
              </Field>
            </Section>

            {/* ===== 문의처 정보 ===== */}
            <Section title="문의처 정보">
              <Grid2>
                <Field label="관리자명 *">
                  <input 
                    ref={contactPersonNameRef}
                    className="ip" 
                    placeholder="관리자 이름을 입력하세요"
                    value={formData.contactPersonName}
                    onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                  />
                </Field>
                <Field label="연락처 *">
                  <input 
                    ref={contactPhoneRef}
                    className="ip" 
                    placeholder="010-0000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="이메일 *">
                  <input 
                    ref={contactEmailRef}
                    className="ip" 
                    type="email"
                    placeholder="관리자 이메일을 입력하세요"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </Field>
                <div/>
              </Grid2>
            </Section>


            <div className="submit-row">
              <button className="btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? '등록 중...' : '장학금 등록하기'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}

/* ====== 작은 UI 유틸 컴포넌트 ====== */
function Section({title, children}){
  return (
    <section className="section">
      <div className="section-head">{title}</div>
      <div className="section-body">{children}</div>
    </section>
  )
}
function Grid2({children}){ return <div className="grid-2">{children}</div> }
function Field({label, children}){
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
