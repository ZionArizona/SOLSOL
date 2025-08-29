import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import type { ApplicationState } from '../../services/scholarship.api';
import { getStateBadgeStyle, getStateLabel } from '../../utils/applicationState';

// 카테고리별 아이콘 컴포넌트
const CategoryIcon = ({ category }: { category?: string }) => {
  const getIconByCategory = () => {
    switch (category?.toLowerCase()) {
      case '성적우수':
      case '학업장려':
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#F0C000" strokeWidth={1}/>
          </Svg>
        );
      case '생활지원':
      case '복지':
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M20.84 4.61C19.32 3.59 17.47 3 15.5 3C13.53 3 11.68 3.59 10.16 4.61C8.64 5.63 7.5 7.13 6.91 8.91C6.32 10.69 6.32 12.31 6.91 14.09C7.5 15.87 8.64 17.37 10.16 18.39C11.68 19.41 13.53 20 15.5 20C17.47 20 19.32 19.41 20.84 18.39C22.36 17.37 23.5 15.87 24.09 14.09C24.68 12.31 24.68 10.69 24.09 8.91C23.5 7.13 22.36 5.63 20.84 4.61Z" fill="#FF6B6B" stroke="#E55656" strokeWidth={1}/>
            <Path d="M12 7V17M8 12H16" stroke="#FFF" strokeWidth={2} strokeLinecap="round"/>
          </Svg>
        );
      case '연구':
      case '학술':
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={4} width={18} height={14} rx={2} fill="#4ECDC4" stroke="#3DB5AD" strokeWidth={1}/>
            <Path d="M8 9H16M8 13H13" stroke="#FFF" strokeWidth={2} strokeLinecap="round"/>
            <Circle cx={7} cy={20} r={2} fill="#4ECDC4"/>
            <Circle cx={17} cy={20} r={2} fill="#4ECDC4"/>
          </Svg>
        );
      case '취업':
      case '창업':
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Rect x={4} y={6} width={16} height={12} rx={2} fill="#845EC2" stroke="#7249B8" strokeWidth={1}/>
            <Path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M12 11V13" stroke="#FFF" strokeWidth={2} strokeLinecap="round"/>
          </Svg>
        );
      case '특기':
      case '예체능':
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} fill="#FF9500" stroke="#E6840E" strokeWidth={1}/>
            <Path d="M8 14S10 16 12 16S16 14 16 14M9 9H9.01M15 9H15.01" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        );
      default:
        return (
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} fill="#6B86FF" stroke="#5A6EE8" strokeWidth={1}/>
            <Path d="M9 12L11 14L15 10" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        );
    }
  };

  return (
    <View style={styles.iconContainer}>
      {getIconByCategory()}
    </View>
  );
};

export const ScholarshipItemCard = ({
  title,
  amount,
  period,
  status,
  category,
  applicationState,
  onPress,
}: {
  title: string;
  amount: string;
  period: string;
  status: string;
  category?: string;
  applicationState?: ApplicationState;
  onPress?: () => void;
}) => {
//   return (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
//       <LinearGradient
//         colors={["#EAF2FF", "#E9F1FF"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.card}
//       >
//         <CategoryIcon category={category} />
//         <View style={{ flex: 1 }}>
//           <Text style={styles.title}>{title}</Text>
//           <Text style={styles.amount}>
//             {amount} <Text style={styles.mile}>마일리지</Text>
//           </Text>
//           <Text style={styles.period}>신청기간: {period}</Text>
//         </View>
//         <View style={styles.badge}>
//           <Text style={styles.badgeText}>{status}</Text>
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };
 return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={["#EAF2FF", "#E9F1FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <CategoryIcon category={category} />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {applicationState && (
            <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }, getStateBadgeStyle(applicationState)]}>
             <Text style={{ fontSize: 12, fontWeight: '700' }}>{getStateLabel(applicationState)}</Text>
            </View>
           )}
         </View>

          <Text style={styles.amount}>
            {amount} <Text style={styles.mile}>마일리지</Text>
          </Text>
          <Text style={styles.period}>신청기간: {period}</Text>
        </View>

        {/* 마감 상태 뱃지 (기존) */}
        <View style={styles.deadlineBadge}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    shadowColor: "#AFC2FF",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  stateBadgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontWeight: "900", color: "#1F2A44", fontSize: 14 },
  amount: { marginTop: 4, fontWeight: "900", color: "#5A84FF" },
  mile: { fontSize: 12, fontWeight: "900" },
  period: { marginTop: 4, color: "#8391B2", fontWeight: "700", fontSize: 12 },
  deadlineBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { color: "#8B90A8", fontWeight: "900", fontSize: 11 },
});
