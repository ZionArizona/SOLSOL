import React, { useMemo, useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Alert,
  Text,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  scholarshipApi,
  FilterParams,
  ScholarshipWithStateResponse,
} from "../../services/scholarship.api";
import { mileageApi } from "../../services/mileage.api";
import SOLBG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { FilterPanel } from "../../components/scholarship/FilterPanel";
import { ScholarshipItemCard } from "../../components/scholarship/ScholarshipItemCard";
import { SectionBox } from "../../components/scholarship/SectionBox";

const PAGE_SIZE_MAIN = 5;
const { width: SCREEN_WIDTH } = Dimensions.get("window"); // ★ 실제 기기 폭 사용

export default function ScholarshipApply() {
  const [scholarships, setScholarships] = useState<ScholarshipWithStateResponse[]>([]);
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterParams>({ status: "OPEN" });

  // 페이징
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 임박 슬라이드
  const [currentSlide, setCurrentSlide] = useState(0);
  const urgentFlatListRef = useRef<FlatList>(null);

  // Android onEndReached 다중 호출 방지 플래그 ★
  const onEndReachedAllowedRef = useRef(true);

  // 날짜 포맷
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "날짜 정보 없음";
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "날짜 정보 오류";
    const startStr = `${start.getMonth() + 1}/${start.getDate()}`;
    const endStr = `${end.getMonth() + 1}/${end.getDate()}`;
    return `${startStr} ~ ${endStr}`;
  };

  // 마감 상태
  const getDeadlineStatus = (endDate: string) => {
    if (!endDate) return "날짜 정보 없음";
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "날짜 정보 오류";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "마감됨";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    if (diffDays <= 7) return `${diffDays}일 남음`;
    return "신청 가능";
  };

  // 응답 노멀라이즈
  const normalize = (data: any) => {
    if (Array.isArray(data)) {
      return { list: data as ScholarshipWithStateResponse[], totalPages: 1, currentPage: 0 };
    }
    const list = data?.items ?? data?.content ?? data?.list ?? data?.scholarships ?? [];
    const currentPage = data?.page ?? data?.currentPage ?? data?.pageNumber ?? 0;
    const pageSize = data?.size ?? PAGE_SIZE_MAIN;
    const total = data?.total ?? data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? (pageSize ? Math.ceil(total / pageSize) : 0);
    return { list, totalPages, currentPage, pageSize };
  };

  // 페이지 로드
  const loadPage = useCallback(
    async (pageToLoad: number, reset = false, filter: FilterParams = currentFilter) => {
      if (pageToLoad === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const [schData, mileageData] = await Promise.all([
          scholarshipApi.getFilteredScholarships({
            ...filter,
            page: pageToLoad,
            size: PAGE_SIZE_MAIN,
          }),
          pageToLoad === 0 ? mileageApi.getUserMileage() : Promise.resolve(null),
        ]);

        const n = normalize(schData);

        if (reset) setScholarships(n.list);
        else setScholarships((prev) => [...prev, ...n.list]);

        // 더 불러올 수 있는지 계산 보강 ★
        let more: boolean;
        if (typeof n.totalPages === "number" && n.totalPages > 0) {
          more = pageToLoad + 1 < n.totalPages;
        } else {
          // totalPages/total 미제공 백엔드 대비
          more = n.list.length >= (n.pageSize || PAGE_SIZE_MAIN);
        }
        setHasMore(more);
        setPage(pageToLoad);

        if (mileageData) {
          setCurrentMileage(mileageData?.availableMileage ?? 0);
        }
      } catch (e) {
        console.error("페이지 로드 오류:", e);
        Alert.alert("오류", "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        // 다음 onEndReached 허용
        onEndReachedAllowedRef.current = true; // ★
      }
    },
    [currentFilter]
  );

  // 최초 로드
  useEffect(() => {
    loadPage(0, true);
  }, []);

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    setCurrentSlide(0);
    loadPage(0, true);
  };

  // 필터 변경
  const handleFilterChange = (filterParams: FilterParams) => {
    setCurrentFilter(filterParams);
    setHasMore(true);
    setCurrentSlide(0);
    loadPage(0, true, filterParams);
  };

  const handleScholarshipPress = (scholarshipId: number) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  // 임박(10일 이내)
  const urgentScholarships = useMemo(() => {
    if (!scholarships || !Array.isArray(scholarships)) return [];
    return scholarships.filter((item) => {
      const endStr = item.scholarship.recruitmentEndDate;
      if (!endStr) return false;
      const end = new Date(endStr);
      if (isNaN(end.getTime())) return false;
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 10;
    });
  }, [scholarships]);

  // 일반 목록
  const regularScholarships = useMemo(() => {
    const urgentIds = new Set(urgentScholarships.map((u) => u.scholarship.id));
    return scholarships.filter((item) => !urgentIds.has(item.scholarship.id));
  }, [scholarships, urgentScholarships]);

  // 임박 슬라이드 아이템
  const renderUrgentItem = ({ item }: { item: ScholarshipWithStateResponse }) => {
    const s = item.scholarship;
    return (
      <View style={{ width: SCREEN_WIDTH /* ★ 화면 폭 */ }}>
        <ScholarshipItemCard
          title={s.scholarshipName}
          amount={s.amount?.toLocaleString?.() ?? "0"}
          period={formatDateRange(s.recruitmentStartDate, s.recruitmentEndDate)}
          status={getDeadlineStatus(s.recruitmentEndDate)}
          category={s.category}
          applicationState={item.state}
          onPress={() => handleScholarshipPress(s.id)}
        />
      </View>
    );
  };

  // 일반 아이템
  const renderRegularItem = ({ item }: { item: ScholarshipWithStateResponse }) => {
    const s = item.scholarship;
    return (
      <View style={styles.phone}>
        <SectionBox>
          <ScholarshipItemCard
            title={s.scholarshipName}
            amount={s.amount?.toLocaleString?.() ?? "0"}
            period={formatDateRange(s.recruitmentStartDate, s.recruitmentEndDate)}
            status={getDeadlineStatus(s.recruitmentEndDate)}
            category={s.category}
            applicationState={item.state}
            onPress={() => handleScholarshipPress(s.id)}
          />
        </SectionBox>
      </View>
    );
  };

  // 무한스크롤 (Android 중복 호출 방지) ★
  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    if (!onEndReachedAllowedRef.current) return; // 스로틀
    onEndReachedAllowedRef.current = false;
    loadPage(page + 1);
  };

  if (loading) {
    return (
      <ImageBackground source={SOLBG} style={styles.bg} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={SOLBG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <FlatList
          data={regularScholarships}
          keyExtractor={(item) => `regular-${item.scholarship.id}`}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={renderRegularItem}
          // 무한스크롤 관련 옵션들 보강 ★
          onEndReachedThreshold={0.15}
          onMomentumScrollBegin={() => {
            // 스크롤 시작 시 onEndReached 재허용
            onEndReachedAllowedRef.current = true;
          }}
          onEndReached={({ distanceFromEnd }) => {
            // iOS/Android 모두에서 과민 호출 방지
            if (distanceFromEnd <= 0) return;
            handleLoadMore();
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // 컨텐츠가 화면보다 작아 onEndReached가 안 불리는 경우를 위해 여유 padding 추가 ★
          ListFooterComponent={
            <View style={styles.footer}>
              {loadingMore && <ActivityIndicator size="small" color="#6B86FF" />}
              {!loadingMore && !hasMore && regularScholarships.length > 0 && (
                <Text style={[styles.emptyText, { textAlign: "center" }]}>모든 항목을 불러왔습니다.</Text>
              )}
              <View style={{ height: 24 }} />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.phone}>
              <TopBar title="장학금 신청" />
              <MileagePanel points={currentMileage} />
              <FilterPanel onFilterChange={handleFilterChange} initialFilter={currentFilter} />

              <SectionBox caption="10일 이내 신청 마감하는 장학금">
                {urgentScholarships.length > 0 ? (
                  <View>
                    <FlatList
                      ref={urgentFlatListRef}
                      data={urgentScholarships}
                      horizontal
                      // 한 장씩 정확히 스냅되도록 pagingEnabled만 사용 ★
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => `urgent-${item.scholarship.id}`}
                      renderItem={renderUrgentItem}
                      // snapToInterval 대신 화면 폭 기준으로 페이징되게 함 ★
                      decelerationRate="fast"
                      disableIntervalMomentum
                      bounces={false}
                      snapToAlignment="start"
                      scrollEventThrottle={16}
                      getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                      })}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH); // ★
                        setCurrentSlide(idx);
                      }}
                      contentContainerStyle={{}} // ★ 여백 제거
                      style={{ width: SCREEN_WIDTH }} // ★ 래퍼 폭 고정
                    />

                    {urgentScholarships.length > 1 && (
                      <View style={styles.pageIndicator}>
                        {urgentScholarships.map((_, i) => (
                          <View
                            key={`dot-${i}`}
                            style={[
                              styles.dot,
                              { backgroundColor: currentSlide === i ? "#6B86FF" : "#C7CFEB" },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>마감 임박 장학금이 없습니다.</Text>
                  </View>
                )}
              </SectionBox>
            </View>
          }
          // Android에서 중첩 스크롤 안정성 ↑ ★
          nestedScrollEnabled={Platform.OS === "android"}
          removeClippedSubviews={false}
        />
      </View>
    </ImageBackground>
  );
}

const PHONE_WIDTH = 360; // 일반 카드 폭은 유지 (섹션 여백용)

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },
  content: {
    alignItems: "center",
    paddingBottom: 48, // ★ 여유 padding
  },
  phone: {
    width: PHONE_WIDTH,
    alignSelf: "center",
    paddingVertical: 8,
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#7C89A6",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    width: PHONE_WIDTH,
    alignSelf: "center",
  },
});
