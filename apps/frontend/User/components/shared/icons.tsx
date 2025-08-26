import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

/** 공통: size prop */
type P = { size?: number; style?: any };
type PBase = { size?: number; style?: any };
type PColor = PBase & { color?: string };

export const CalendarIcon = ({ size = 28, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M7 2v3M17 2v3M3 9h18" stroke="#222" strokeWidth={1.7} strokeLinecap="round" />
    <Rect x={3} y={5} width={18} height={16} rx={8} stroke="#222" strokeWidth={1.7} />
    <Rect x={6.25} y={12.25} width={4.5} height={4.5} rx={1.2} fill="#5D87FF" />
  </Svg>
);

export const FileBoxIcon = ({ size = 28, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3.5 7.5h6l1.6-2h7.4A2.5 2.5 0 0 1 21 8v9.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5V9a1.5 1.5 0 0 1 .5-1.5Z" stroke="#222" strokeWidth={1.7} />
    <Rect x={7} y={11} width={10} height={2.4} rx={1.2} fill="#7BC3FF" />
  </Svg>
);

export const ScholarshipIcon = ({ size = 28, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 3l2.5 5 5.5.7-4 3.8 1 5.5L12 15l-5 3 1-5.5-4-3.8 5.5-.7L12 3Z" stroke="#222" strokeWidth={1.6} />
    <Path d="M12 15l-5 3 1-5.5-4-3.8 5.5-.7L12 3v12Z" fill="#AFE3FF" />
  </Svg>
);

export const BellIcon = ({ size = 28, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" stroke="#222" strokeWidth={1.7} />
    <Path d="M10 19a2 2 0 0 0 4 0" stroke="#222" strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

/** 둥근 마스코트 */
export const Mascot = ({ size = 56, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 56 56" fill="none" style={style}>
    <Circle cx={28} cy={28} r={28} fill="#E8F1FF" />
    <Circle cx={28} cy={26} r={13} fill="#fff" />
    <Circle cx={23} cy={25} r={2.2} fill="#222" />
    <Circle cx={33} cy={25} r={2.2} fill="#222" />
    <Path d="M23 32c3.5 2.4 6.5 2.4 10 0" stroke="#7AA6FF" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

/** 배너용 일러스트(경량) */
export const BannerArt = ({ size = 96, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <Circle cx="50" cy="50" r="48" fill="#F8FBFF" />
    <Path d="M30 55c8 6 32 6 40 0" stroke="#6E9BFF" strokeWidth="3" strokeLinecap="round" />
    <Circle cx="40" cy="45" r="4" fill="#3B3B3B" />
    <Circle cx="60" cy="45" r="4" fill="#3B3B3B" />
    <Path d="M50 14l10 10-10 10-10-10 10-10Z" fill="#7AA6FF" />
    <Path d="M74 70l-10-5-10 5 10 5 10-5Z" fill="#7AA6FF" />
  </Svg>
);

export const ChevronLeftIcon = ({ size = 22, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M15 19L8 12l7-7" stroke="#2B3A5A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HomeIcon = ({ size = 20, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M3 10.5 12 4l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5Z" stroke="#2B3A5A" strokeWidth={1.8}/>
  </Svg>
);

export const MenuIcon = ({ size = 20, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M4 6h16M4 12h16M4 18h16" stroke="#2B3A5A" strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);


export const CalendarSmallIcon = ({ size = 18, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M7 2v3M17 2v3M3 9h18" stroke="#2C3E66" strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="#2C3E66" strokeWidth={1.8}/>
  </Svg>
);

export const NoteIcon = ({ size = 18, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="#2C3E66" strokeWidth={1.8}/>
    <Path d="M14 3v6h6" stroke="#2C3E66" strokeWidth={1.8}/>
  </Svg>
);

export const SparkIcon = ({ size = 18, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M12 2l2.5 5L20 9l-5 1.5L13 16l-3-4.5L5 10l5-1.5L12 2Z" stroke="#2C3E66" strokeWidth={1.6}/>
  </Svg>
);

export const FileIcon = ({ size = 18, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="#2C3E66" strokeWidth={1.8}/>
    <Path d="M14 3v5h5" stroke="#2C3E66" strokeWidth={1.8}/>
  </Svg>
);

export const DotIcon = ({ size = 6, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 8 8" style={style} fill="none">
    <Circle cx="4" cy="4" r="3" fill="#FFC45A"/>
  </Svg>
);

export const UserCircleIcon = ({ size = 24, style }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#2B3A5A" strokeWidth={1.8} />
    <Path d="M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="#2B3A5A" strokeWidth={1.8}/>
    <Path d="M5.5 18.2c1.8-2.6 4.4-3.9 6.5-3.9s4.7 1.3 6.5 3.9" stroke="#2B3A5A" strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

export const SearchIcon = ({ size = 18, color = "#2C3E66", style }: PColor) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M11 19a8 8 0 1 1 5.292-13.964A8 8 0 0 1 11 19Z" stroke={color} strokeWidth={1.8}/>
    <Path d="M16.65 16.65L21 21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

export const UploadIcon = ({ size = 16, color = "#6B86FF", style }: PColor) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M12 16V6" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M8 9l4-4 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 18h16" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

export const BulkManageIcon = ({ size = 16, color = "#6B86FF", style }: PColor) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <Path d="M4 6h16M4 12h16M4 18h16" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);