import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { scholarshipApi, scholarshipUtils } from '../lib/ScholarshipStore'
import './scholarship-create.css'

export default function ScholarshipCreate(){
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  // 기본 정보
  const [formData, setFormData] = useState({
    scholarshipName: '',
    amount: '',
    type: '',
    numberOfRecipients: '',
    paymentMethod: 'LUMP_SUM',
    recruitmentStartDate: '',
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
    contactPhone: '',
    contactEmail: '',
    officeLocation: '',
    consultationHours: '',
    noticeTitle: '',
    noticeContent: ''
  })

  // 제출서류/평가기준 동적 리스트
  const [reqName, setReqName] = useState('')
  const [stdPoint, setStdPoint] = useState('')
  const [weight, setWeight] = useState('')
  const [criteria, setCriteria] = useState([])
  
  // 제출서류
  const [docName, setDocName] = useState('')
  const [docKeywords, setDocKeywords] = useState('')
  const [docRequired, setDocRequired] = useState(true)
  const [requiredDocuments, setRequiredDocuments] = useState([])

  const totalWeight = criteria.reduce((s,c)=> s + Number(c.weight||0), 0)

  // 컴포넌트 마운트 시 카테고리 목록 로드
  useEffect(() => {
    loadCategories()
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
    setCriteria(list => [...list, {name:reqName.trim(), std:stdPoint||'-', weight:weight||0}])
    setReqName(''); setStdPoint(''); setWeight('')
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
    
    if (!formData.scholarshipName || !formData.amount || !formData.numberOfRecipients || 
        !formData.type || !formData.recruitmentEndDate || !formData.evaluationStartDate ||
        !formData.resultAnnouncementDate || !formData.eligibilityCondition ||
        !formData.contactPersonName || !formData.contactPhone || !formData.contactEmail) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    
    try {
      // criteria를 requiredDocuments로 변환
      const requiredDocuments = criteria.map(c => ({
        name: c.name,
        keywords: [c.name.toLowerCase()],
        required: true
      }))

      const scholarshipData = scholarshipUtils.transformForBackend({
        ...formData,
        criteria,
        requiredDocuments,
        recruitmentStatus: 'OPEN'
      })

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
                    className="ip" 
                    placeholder="장학명을 입력하세요"
                    value={formData.scholarshipName}
                    onChange={(e) => handleInputChange('scholarshipName', e.target.value)}
                  />
                </Field>
                <Field label="장학금 지급 금액 *">
                  <input 
                    className="ip" 
                    type="number"
                    placeholder="금액을 입력하세요 (원)"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="장학금 종류 *">
                  <select 
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
                <Field label="선발 인원 *">
                  <input 
                    className="ip" 
                    type="number"
                    placeholder="선발 인원을 입력하세요"
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
                    className="ip" 
                    type="date"
                    value={formData.recruitmentEndDate}
                    onChange={(e) => handleInputChange('recruitmentEndDate', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Field label="지원 자격 조건 *">
                <input 
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

              <Field label="장학금 카테고리/태그">
                <select 
                  className="ip"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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

            {/* ===== 제출 서류 및 평가 기준 ===== */}
            <Section title="제출 서류 및 평가 기준">
              <div className="criteria-row">
                <input className="ip flex1" placeholder="항목을 입력하세요 (예: 성적증명서, 봉사시간) "
                       value={reqName} onChange={e=>setReqName(e.target.value)} />
                <input className="ip w120" placeholder="기준 점수"
                       value={stdPoint} onChange={e=>setStdPoint(e.target.value)} />
                <div className="w120 with-suffix">
                  <input className="ip" placeholder="가중치" value={weight} onChange={e=>setWeight(e.target.value)} />
                  <span className="suffix">%</span>
                </div>
                <button type="button" className="btn-add" onClick={addCriteria}>추가</button>
              </div>

              <div className="criteria-list">
                {criteria.length===0 && <div className="empty">추가된 항목이 없습니다. (가중치 합계 100%가 되도록 설정해 주세요)</div>}
                {criteria.map((c,idx)=>(
                  <div className="chip" key={idx}>
                    <span className="name">{c.name}</span>
                    <span className="meta">기준 {c.std} / 가중치 {c.weight}%</span>
                    <button type="button" className="del" onClick={()=>removeCriteria(idx)}>삭제</button>
                  </div>
                ))}
              </div>

              <div className={`weight-note ${totalWeight===100?'ok':''}`}>
                가중치 합계: <b>{totalWeight}%</b> {totalWeight===100 ? '(OK)' : '(100%가 되도록 설정)'}
              </div>
            </Section>

            {/* ===== 심사 관련 ===== */}
            <Section title="심사 관련">
              <Grid2>
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
                <Field label="면접 예정일">
                  <input 
                    className="ip" 
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e) => handleInputChange('interviewDate', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Grid2>
                <Field label="심사 시작일 *">
                  <input 
                    className="ip" 
                    type="date"
                    value={formData.evaluationStartDate}
                    onChange={(e) => handleInputChange('evaluationStartDate', e.target.value)}
                  />
                </Field>
                <Field label="결과 발표일 *">
                  <input 
                    className="ip" 
                    type="date"
                    value={formData.resultAnnouncementDate}
                    onChange={(e) => handleInputChange('resultAnnouncementDate', e.target.value)}
                  />
                </Field>
              </Grid2>
            </Section>

            {/* ===== 문의처 정보 ===== */}
            <Section title="문의처 정보">
              <Grid2>
                <Field label="담당자명 *">
                  <input 
                    className="ip" 
                    placeholder="담당자 이름을 입력하세요"
                    value={formData.contactPersonName}
                    onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                  />
                </Field>
                <Field label="연락처 *">
                  <input 
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
                    className="ip" 
                    type="email"
                    placeholder="contact@university.ac.kr"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </Field>
                <Field label="사무실 위치">
                  <input 
                    className="ip" 
                    placeholder="예: 학생회관 2층 201호"
                    value={formData.officeLocation}
                    onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                  />
                </Field>
              </Grid2>

              <Field label="상담 가능 시간">
                <input 
                  className="ip" 
                  placeholder="예: 평일 09:00~18:00 (점심 12:00~13:00 제외)"
                  value={formData.consultationHours}
                  onChange={(e) => handleInputChange('consultationHours', e.target.value)}
                />
              </Field>
            </Section>

            {/* ===== 공지사항 ===== */}
            <Section title="공지사항">
              <Field label="공지사항 제목">
                <input 
                  className="ip" 
                  placeholder="공지사항 제목을 입력하세요"
                  value={formData.noticeTitle}
                  onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
                />
              </Field>

              <Field label="공지사항 내용">
                <textarea 
                  className="ta" 
                  rows={5} 
                  placeholder="공지사항 내용을 입력하세요"
                  value={formData.noticeContent}
                  onChange={(e) => handleInputChange('noticeContent', e.target.value)}
                />
              </Field>

              <Field label="첨부 이미지">
                <div className="dropzone">
                  클릭하여 이미지를 업로드하세요<br/>JPG, PNG 파일만 업로드 가능합니다
                </div>
              </Field>
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
