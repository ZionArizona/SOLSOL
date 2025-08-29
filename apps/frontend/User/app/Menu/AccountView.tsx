import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BG from "../../assets/images/SOLSOLBackground.png";
import LoginMascot from "../../assets/images/LoginPageCharacter.png";
import { TopBar } from "../../components/scholarship/TopBar";
import api from "../../utils/apiClient";
import Svg, { Path, Circle } from "react-native-svg";

// 환전 내역 타입
interface ExchangeRecord {
  exchangeNm: number;
  userNm: string;
  amount: number;
  state: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  processedAt?: string;
}

// 거래 내역 타입
interface TransactionRecord {
  transactionUniqueNo: string;
  transactionDate: string;
  transactionTime: string;
  transactionType: string;
  transactionTypeName: string;
  transactionBalance: number;
  transactionAfterBalance: number;
  transactionSummary: string;
  transactionMemo: string;
}

// 계좌 정보 타입
interface AccountBalance {
  accountNo: string;
  accountName: string;
  accountBalance: number;
  bankName: string;
  userName: string;
}

export default function AccountViewPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'exchange'>('transactions');
  
  // 데이터 상태
  const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRecord[]>([]);
  
  // 환전 신청 상태
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // 데이터 로드 함수들
  const loadAccountBalance = async () => {
    try {
      const response = await api.get('/exchange/account/balance');
      console.log('Raw Response:', response);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        return;
      }
      
      const responseData = await response.json();
      console.log('=== BALANCE API RESPONSE ===');
      console.log('Full Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData?.success && responseData?.data) {
        // 신한은행 API 응답 구조에 맞춰 처리
        const bankResponse = responseData.data;
        console.log('=== BANK RESPONSE DATA ===');
        console.log('Bank Response:', JSON.stringify(bankResponse, null, 2));
        console.log('Has REC:', !!bankResponse?.REC);
        console.log('Has rec:', !!bankResponse?.rec);
        
        // 신한은행 API 응답에서 REC 필드 확인
        if (bankResponse?.REC || bankResponse?.rec) {
          const accountData = bankResponse.REC || bankResponse.rec;
          console.log('=== ACCOUNT DATA ===');
          console.log('Account Data:', JSON.stringify(accountData, null, 2));
          
          // AccountBalance 형태로 변환
          const balance: AccountBalance = {
            accountNo: accountData.accountNo || '',
            accountName: accountData.accountName || accountData.accountTypeName || '수시입출금',
            accountBalance: accountData.accountBalance || 0,
            bankName: accountData.bankName || '신한은행',
            userName: accountData.userName || ''
          };
          
          setAccountBalance(balance);
          console.log('=== FINAL BALANCE SET ===');
          console.log('Set balance:', balance);
        } else {
          console.log('❌ Balance response format not recognized');
          console.log('Available keys in bankResponse:', Object.keys(bankResponse || {}));
        }
      } else {
        console.log('API call not successful:', responseData);
      }
    } catch (error) {
      console.error('계좌 잔액 조회 실패:', error);
      // Alert.alert('오류', '계좌 정보를 불러올 수 없습니다.');
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await api.get('/exchange/account/transactions?days=30');
      console.log('Transaction Raw Response:', response);
      
      if (!response.ok) {
        console.error('Transaction response not ok:', response.status, response.statusText);
        return;
      }
      
      const responseData = await response.json();
      console.log('Transaction API Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData?.success && responseData?.data) {
        // 신한은행 API 응답 구조에 맞춰 처리
        const bankResponse = responseData.data;
        console.log('Transaction Data:', JSON.stringify(bankResponse, null, 2));
        
        // 신한은행 API 응답에서 REC 필드와 list 확인
        if (bankResponse?.REC?.list) {
          setTransactions(bankResponse.REC.list);
          console.log('Set transactions from REC.list:', bankResponse.REC.list.length, '건');
        } else if (bankResponse?.rec?.list) {
          setTransactions(bankResponse.rec.list);
          console.log('Set transactions from rec.list:', bankResponse.rec.list.length, '건');
        } else {
          console.log('Transaction response format not recognized:', responseData);
          setTransactions([]); // 빈 배열로 설정
        }
      } else {
        console.log('Transaction API call not successful:', responseData);
        setTransactions([]);
      }
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      setTransactions([]);
    }
  };

  const loadExchangeHistory = async () => {
    try {
      const response = await api.get('/exchange/history');
      if (!response.ok) return;
      
      const responseData = await response.json();
      if (responseData?.success && responseData.data) {
        setExchangeHistory(responseData.data);
      }
    } catch (error) {
      console.error('환전 내역 조회 실패:', error);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAccountBalance(),
        loadTransactions(),
        loadExchangeHistory()
      ]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 환전 신청
  const handleExchangeRequest = async () => {
    if (!exchangeAmount || isNaN(Number(exchangeAmount)) || Number(exchangeAmount) <= 0) {
      Alert.alert('알림', '올바른 금액을 입력해주세요.');
      return;
    }

    try {
      setExchangeLoading(true);
      const response = await api.post('/exchange/request', {
        amount: Number(exchangeAmount)
      });

      if (!response.ok) {
        Alert.alert('오류', '환전 신청에 실패했습니다.');
        return;
      }

      const responseData = await response.json();
      if (responseData?.success) {
        Alert.alert('완료', '환전 신청이 완료되었습니다.');
        setExchangeAmount('');
        loadExchangeHistory();
      } else {
        Alert.alert('오류', responseData?.error || '환전 신청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('환전 신청 실패:', error);
      Alert.alert('오류', error.response?.data?.error || '환전 신청에 실패했습니다.');
    } finally {
      setExchangeLoading(false);
    }
  };

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAllData();
  }, []);

  // 상태 라벨 변환
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'pending': return { label: '대기 중', color: '#FFA500' };
      case 'approved': return { label: '완료', color: '#4CAF50' };
      case 'rejected': return { label: '거절', color: '#FF5252' };
      default: return { label: '알 수 없음', color: '#999999' };
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  if (loading) {
    return (
      <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.phone}>
          <TopBar title="내 계좌" />

          {/* 잔액 표시 패널 (마일리지 스타일) */}
          <LinearGradient
            colors={["#BFD4FF", "#EAF0FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balancePanel}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceCaption}>회원님의 현재 잔액은</Text>
              <Text style={styles.balancePoint}>
                {accountBalance?.accountBalance !== undefined ? 
                  accountBalance.accountBalance.toLocaleString() : 
                  '조회 중...'
                } <Text style={styles.wonUnit}>원</Text>
              </Text>
            </View>
            <Image source={LoginMascot} style={styles.mascot} resizeMode="contain" />
          </LinearGradient>

          {/* 탭 버튼 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'transactions' && styles.activeTab]}
              onPress={() => setActiveTab('transactions')}
            >
              <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
                거래 내역
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'exchange' && styles.activeTab]}
              onPress={() => setActiveTab('exchange')}
            >
              <Text style={[styles.tabText, activeTab === 'exchange' && styles.activeTabText]}>
                환전 내역
              </Text>
            </TouchableOpacity>
          </View>


          {/* 거래 내역 탭 */}
          {activeTab === 'transactions' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>최근 30일 거래 내역</Text>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <LinearGradient
                    key={transaction.transactionUniqueNo}
                    colors={["#F8FAFC", "#FFFFFF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.transactionCard}
                  >
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionType}>
                        {transaction.transactionTypeName}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {transaction.transactionDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')}
                      </Text>
                    </View>
                    <Text style={styles.transactionSummary}>
                      {transaction.transactionSummary}
                    </Text>
                    <View style={styles.transactionAmounts}>
                      <Text style={[
                        styles.transactionAmount,
                        { color: transaction.transactionType === '2' ? '#FF5252' : '#4CAF50' }
                      ]}>
                        {transaction.transactionType === '2' ? '-' : '+'}{formatAmount(transaction.transactionBalance)}
                      </Text>
                      <Text style={styles.afterBalance}>
                        잔액 {formatAmount(transaction.transactionAfterBalance)}
                      </Text>
                    </View>
                  </LinearGradient>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>거래 내역이 없습니다</Text>
                </View>
              )}
            </View>
          )}

          {/* 환전 내역 탭 */}
          {activeTab === 'exchange' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>환전 신청 내역</Text>
              {exchangeHistory.length > 0 ? (
                exchangeHistory.map((exchange) => {
                  const stateInfo = getStateLabel(exchange.state);
                  return (
                    <LinearGradient
                      key={exchange.exchangeNm}
                      colors={["#F8FAFC", "#FFFFFF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.exchangeCard}
                    >
                      <View style={styles.exchangeHeader}>
                        <Text style={styles.exchangeAmount}>
                          {exchange.amount.toLocaleString()}원
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: stateInfo.color }]}>
                          <Text style={styles.statusText}>{stateInfo.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.exchangeDate}>
                        신청일: {formatDate(exchange.appliedAt)}
                      </Text>
                      {exchange.processedAt && (
                        <Text style={styles.exchangeDate}>
                          처리일: {formatDate(exchange.processedAt)}
                        </Text>
                      )}
                    </LinearGradient>
                  );
                })
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>환전 내역이 없습니다</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  
  // 마일리지 스타일 잔액 패널
  balancePanel: {
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#9fb6ff",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginTop: 8,
  },
  
  balanceCaption: { 
    color: "#2C3E66", 
    fontWeight: "700" 
  },
  
  balancePoint: { 
    fontSize: 28, 
    fontWeight: "900", 
    color: "#1F2A44", 
    marginTop: 2 
  },
  
  wonUnit: { 
    fontSize: 14, 
    fontWeight: "900" 
  },
  
  mascot: {
    width: 64,
    height: 64,
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F0F4F8',
    padding: 4,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#B8C2D6',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C89A6',
  },
  
  activeTabText: {
    color: '#6B86FF',
  },
  
  content: {
    marginHorizontal: 12,
    marginTop: 16,
  },
  
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#B8C2D6",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  
  bankInfo: {
    marginBottom: 20,
  },
  
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  accountNo: {
    color: '#E8EFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  balanceInfo: {
    marginBottom: 16,
  },
  
  balanceLabel: {
    color: '#E8EFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  
  accountHolder: {
    color: '#E8EFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E66',
    marginBottom: 16,
  },
  
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#B8C2D6",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  transactionType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E66',
  },
  
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C89A6',
  },
  
  transactionSummary: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A6B8C',
    marginBottom: 12,
  },
  
  transactionAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  afterBalance: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C89A6',
  },
  
  exchangeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#B8C2D6",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  exchangeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E66',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  exchangeDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C89A6',
    marginBottom: 4,
  },
  
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  
  noDataText: {
    fontSize: 14,
    color: '#7C89A6',
    fontWeight: '500',
  },
});