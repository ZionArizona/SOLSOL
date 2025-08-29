import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './exchange-manage.css';

export default function ExchangeManage() {
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [userMileages, setUserMileages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mileageLoading, setMileageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mileages'); // mileages, pending, all
  const [processingId, setProcessingId] = useState(null);
  const [convertingUserId, setConvertingUserId] = useState(null);

  // 사용자 마일리지 목록 조회
  const loadUserMileages = async () => {
    try {
      setMileageLoading(true);
      const response = await api.get('/exchange/admin/university-mileages');
      
      if (response.success) {
        // 마일리지 높은 순으로 정렬
        const sortedUsers = response.data.users.sort((a, b) => b.availableMileage - a.availableMileage);
        setUserMileages(sortedUsers);
      }
    } catch (error) {
      console.error('사용자 마일리지 조회 실패:', error);
      if (error.message.includes('인증') || error.message.includes('Unauthorized')) {
        alert('관리자 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      }
      alert('사용자 마일리지 목록을 불러오는데 실패했습니다.');
    } finally {
      setMileageLoading(false);
    }
  };

  // 환전 신청 목록 조회
  const loadExchangeRequests = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'pending' ? '/exchange/admin/pending' : '/exchange/admin/all';
      const response = await api.get(endpoint);
      
      if (response.success) {
        setExchangeRequests(response.data);
      }
    } catch (error) {
      console.error('환전 신청 조회 실패:', error);
      if (error.message.includes('인증') || error.message.includes('Unauthorized')) {
        alert('관리자 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      }
      alert('환전 신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 마일리지 환전 처리 (관리자 직접 환전)
  const handleMileageConvert = async (userNm, availableMileage) => {
    if (availableMileage <= 0) {
      alert('환전할 마일리지가 없습니다.');
      return;
    }

    const amount = prompt(`${userNm}의 마일리지를 환전합니다.\n현재 사용 가능 마일리지: ${availableMileage.toLocaleString()}P\n\n환전할 마일리지를 입력하세요 (1P = 1원):`, availableMileage);
    
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      alert('올바른 마일리지를 입력해주세요.');
      return;
    }

    const mileageAmount = parseInt(amount);
    if (mileageAmount > availableMileage) {
      alert('사용 가능한 마일리지보다 많이 입력할 수 없습니다.');
      return;
    }

    if (!confirm(`${userNm}의 마일리지 ${mileageAmount.toLocaleString()}P를 ${mileageAmount.toLocaleString()}원으로 환전하시겠습니까?`)) {
      return;
    }

    try {
      setConvertingUserId(userNm);
      
      console.log('=== 마일리지 환전 요청 ===');
      console.log('userNm:', userNm);
      console.log('mileageAmount:', mileageAmount);
      
      const response = await api.post('/exchange/admin/convert-mileage', {
        userNm,
        mileageAmount
      });

      console.log('=== 마일리지 환전 응답 ===');
      console.log('response:', response);

      if (response.success) {
        alert(response.message);
        loadUserMileages(); // 목록 새로고침
      }
    } catch (error) {
      console.error('마일리지 환전 실패:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', error);
      alert(error.response?.data?.error || error.message || '마일리지 환전에 실패했습니다.');
    } finally {
      setConvertingUserId(null);
    }
  };

  // 환전 처리 (승인/거절)
  const handleExchangeProcess = async (exchangeNm, userNm, approved) => {
    if (!confirm(approved ? '환전을 승인하시겠습니까?' : '환전을 거절하시겠습니까?')) {
      return;
    }

    try {
      setProcessingId(exchangeNm);
      
      const response = await api.post('/exchange/admin/process', {
        exchangeNm,
        userNm,
        approved
      });

      if (response.success) {
        alert(response.message);
        loadExchangeRequests(); // 목록 새로고침
      }
    } catch (error) {
      console.error('환전 처리 실패:', error);
      alert(error.response?.data?.error || '환전 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  // 상태 라벨 및 색상 반환
  const getStateDisplay = (state) => {
    switch (state) {
      case 'pending':
        return { label: '대기 중', className: 'status-pending' };
      case 'approved':
        return { label: '승인 완료', className: 'status-approved' };
      case 'rejected':
        return { label: '거절', className: 'status-rejected' };
      default:
        return { label: '알 수 없음', className: 'status-unknown' };
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return amount?.toLocaleString('ko-KR') + '원';
  };

  useEffect(() => {
    if (activeTab === 'mileages') {
      loadUserMileages();
    } else {
      loadExchangeRequests();
    }
  }, [activeTab]);

  // 초기 로드
  useEffect(() => {
    loadUserMileages();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="exchange-manage-container">
        <div className="page-header">
        <h1 className="page-title">마일리지 환전 관리</h1>
        <p className="page-description">사용자들의 마일리지 환전 신청을 관리합니다.</p>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button 
          className={`tab-button ${activeTab === 'mileages' ? 'active' : ''}`}
          onClick={() => setActiveTab('mileages')}
        >
          사용자 마일리지 ({userMileages.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          대기 중 ({exchangeRequests.filter(req => req.state === 'pending').length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 내역
        </button>
      </div>

      {/* 새로고침 버튼 */}
      <div className="control-bar">
        <button 
          className="refresh-button"
          onClick={activeTab === 'mileages' ? loadUserMileages : loadExchangeRequests}
          disabled={activeTab === 'mileages' ? mileageLoading : loading}
        >
          {(activeTab === 'mileages' ? mileageLoading : loading) ? '로딩 중...' : '새로고침'}
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="exchange-list">
        {activeTab === 'mileages' ? (
          /* 사용자 마일리지 목록 */
          mileageLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>사용자 마일리지 목록을 불러오는 중...</p>
            </div>
          ) : userMileages.length === 0 ? (
            <div className="no-data">
              <p>사용자 마일리지 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="exchange-table">
              <div className="table-header">
                <div className="header-cell">사용자명</div>
                <div className="header-cell">사용자ID</div>
                <div className="header-cell">총 마일리지</div>
                <div className="header-cell">사용 가능</div>
                <div className="header-cell">환전 대기</div>
                <div className="header-cell">액션</div>
              </div>
              
              {userMileages.map((user) => (
                <div key={user.userNm} className="table-row">
                  <div className="cell">{user.userName}</div>
                  <div className="cell">{user.userId}</div>
                  <div className="cell amount">{user.totalMileage.toLocaleString()}P</div>
                  <div className="cell amount available">{user.availableMileage.toLocaleString()}P</div>
                  <div className="cell amount pending">{user.pendingExchange.toLocaleString()}P</div>
                  <div className="cell actions">
                    {user.availableMileage > 0 ? (
                      <button
                        className="convert-button"
                        onClick={() => handleMileageConvert(user.userNm, user.availableMileage)}
                        disabled={convertingUserId === user.userNm}
                      >
                        {convertingUserId === user.userNm ? '환전 중...' : '환전하기'}
                      </button>
                    ) : (
                      <span className="no-mileage">환전 불가</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* 환전 신청 목록 */
          loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>환전 신청 목록을 불러오는 중...</p>
            </div>
          ) : exchangeRequests.length === 0 ? (
            <div className="no-data">
              <p>환전 신청 내역이 없습니다.</p>
            </div>
          ) : (
          <div className="exchange-table">
            <div className="table-header">
              <div className="header-cell">신청번호</div>
              <div className="header-cell">사용자</div>
              <div className="header-cell">금액</div>
              <div className="header-cell">상태</div>
              <div className="header-cell">신청일시</div>
              <div className="header-cell">처리일시</div>
              <div className="header-cell">액션</div>
            </div>
            
            {exchangeRequests.map((request) => {
              const stateDisplay = getStateDisplay(request.state);
              return (
                <div key={request.exchangeNm} className="table-row">
                  <div className="cell">{request.exchangeNm}</div>
                  <div className="cell">{request.userNm}</div>
                  <div className="cell amount">{formatAmount(request.amount)}</div>
                  <div className="cell">
                    <span className={`status-badge ${stateDisplay.className}`}>
                      {stateDisplay.label}
                    </span>
                  </div>
                  <div className="cell date">{formatDate(request.appliedAt)}</div>
                  <div className="cell date">{formatDate(request.processedAt)}</div>
                  <div className="cell actions">
                    {request.state === 'pending' ? (
                      <div className="action-buttons">
                        <button
                          className="approve-button"
                          onClick={() => handleExchangeProcess(request.exchangeNm, request.userNm, true)}
                          disabled={processingId === request.exchangeNm}
                        >
                          {processingId === request.exchangeNm ? '처리 중...' : '승인'}
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleExchangeProcess(request.exchangeNm, request.userNm, false)}
                          disabled={processingId === request.exchangeNm}
                        >
                          거절
                        </button>
                      </div>
                    ) : (
                      <span className="completed">처리 완료</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )
        )}
      </div>

      {/* 통계 정보 */}
      {!loading && exchangeRequests.length > 0 && (
        <div className="statistics">
          <div className="stat-card">
            <h3>전체 신청</h3>
            <div className="stat-value">{exchangeRequests.length}건</div>
          </div>
          <div className="stat-card">
            <h3>대기 중</h3>
            <div className="stat-value pending">
              {exchangeRequests.filter(req => req.state === 'pending').length}건
            </div>
          </div>
          <div className="stat-card">
            <h3>승인 완료</h3>
            <div className="stat-value approved">
              {exchangeRequests.filter(req => req.state === 'approved').length}건
            </div>
          </div>
          <div className="stat-card">
            <h3>총 환전 금액</h3>
            <div className="stat-value">
              {formatAmount(
                exchangeRequests
                  .filter(req => req.state === 'approved')
                  .reduce((sum, req) => sum + req.amount, 0)
              )}
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </>
  );
}