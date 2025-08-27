import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BookmarkedScholarship {
  id: number;
  scholarshipName: string;
  amount: number;
  recruitmentEndDate: string;
  recruitmentStatus: string;
}

export const MyBookmarksPanel = () => {
  const [bookmarkedScholarships, setBookmarkedScholarships] = useState<BookmarkedScholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarkedScholarships();
  }, []);

  const fetchBookmarkedScholarships = async () => {
    try {
      const response = await fetch('/api/bookmarks/my-scholarships', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookmarkedScholarships(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarked scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (scholarshipId: number) => {
    try {
      const response = await fetch(`/api/bookmarks/scholarships/${scholarshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });
      
      if (response.ok) {
        setBookmarkedScholarships(prev => 
          prev.filter(scholarship => scholarship.id !== scholarshipId)
        );
        Alert.alert('알림', '찜목록에서 제거되었습니다.');
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      Alert.alert('오류', '찜 해제에 실패했습니다.');
    }
  };

  const getAuthToken = async () => {
    // 실제 구현에서는 AsyncStorage나 다른 저장소에서 토큰을 가져와야 합니다
    return '';
  };

  const formatAmount = (amount: number) => {
    return `${(amount / 10000).toLocaleString()}만원`;
  };

  const getDaysUntilDeadline = (endDate: string) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
        <Text style={styles.title}>찜한 장학금</Text>
        <Text style={styles.loading}>로딩 중...</Text>
      </LinearGradient>
    );
  }

  if (bookmarkedScholarships.length === 0) {
    return (
      <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
        <Text style={styles.title}>찜한 장학금</Text>
        <Text style={styles.emptyText}>찜한 장학금이 없습니다.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>찜한 장학금 ({bookmarkedScholarships.length})</Text>
      <ScrollView style={styles.scrollView}>
        {bookmarkedScholarships.map((scholarship, index) => {
          const daysLeft = getDaysUntilDeadline(scholarship.recruitmentEndDate);
          const isUrgent = daysLeft <= 3 && daysLeft > 0;
          const isClosed = scholarship.recruitmentStatus === 'CLOSED';
          
          return (
            <View key={scholarship.id} style={styles.scholarshipCard}>
              <View style={styles.scholarshipHeader}>
                <Text style={styles.scholarshipName} numberOfLines={1}>
                  {scholarship.scholarshipName}
                </Text>
                <TouchableOpacity 
                  onPress={() => removeBookmark(scholarship.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.scholarshipInfo}>
                <Text style={styles.amount}>{formatAmount(scholarship.amount)}</Text>
                <View style={styles.deadlineContainer}>
                  {isClosed ? (
                    <Text style={styles.closedText}>모집종료</Text>
                  ) : (
                    <Text style={[
                      styles.deadline,
                      isUrgent && styles.urgentDeadline
                    ]}>
                      {daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? 'D-DAY' : '마감'}
                    </Text>
                  )}
                </View>
              </View>
              
              <Text style={styles.endDate}>
                마감일: {new Date(scholarship.recruitmentEndDate).toLocaleDateString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { 
    margin: 12, 
    borderRadius: 16, 
    padding: 14,
    maxHeight: 400
  },
  title: { 
    fontWeight: "900", 
    color: "#2C3E66", 
    marginBottom: 12,
    fontSize: 16
  },
  scrollView: {
    maxHeight: 320
  },
  loading: {
    color: "#7C89A6",
    textAlign: "center",
    paddingVertical: 20
  },
  emptyText: {
    color: "#7C89A6",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic"
  },
  scholarshipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8EFFF"
  },
  scholarshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  scholarshipName: {
    color: "#2C3E66",
    fontWeight: "700",
    fontSize: 14,
    flex: 1
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12
  },
  scholarshipInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  amount: {
    color: "#4A90E2",
    fontWeight: "700",
    fontSize: 14
  },
  deadlineContainer: {
    alignItems: "flex-end"
  },
  deadline: {
    color: "#7C89A6",
    fontWeight: "600",
    fontSize: 12
  },
  urgentDeadline: {
    color: "#FF6B6B",
    fontWeight: "700"
  },
  closedText: {
    color: "#999999",
    fontWeight: "600",
    fontSize: 12
  },
  endDate: {
    color: "#7C89A6",
    fontSize: 11,
    fontWeight: "500"
  }
});