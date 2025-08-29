import type { ApplicationState } from '../services/scholarship.api';

/**
 * 신청 상태에 따른 뱃지 스타일을 반환합니다.
 */
export const getStateBadgeStyle = (state: ApplicationState) => {
  switch (state) {
    case 'NONE':
      return {
        backgroundColor: '#F5F5F5',
        color: '#666666'
      };
    case 'PENDING':
      return {
        backgroundColor: '#FFF3CD',
        color: '#856404'
      };
    case 'APPROVED':
      return {
        backgroundColor: '#D4EDDA',
        color: '#155724'
      };
    case 'REJECTED':
      return {
        backgroundColor: '#F8D7DA',
        color: '#721C24'
      };
    default:
      return {
        backgroundColor: '#F5F5F5',
        color: '#666666'
      };
  }
};

/**
 * 신청 상태에 따른 텍스트 라벨을 반환합니다.
 */
export const getStateLabel = (state: ApplicationState): string => {
  switch (state) {
    case 'NONE':
      return '미신청';
    case 'PENDING':
      return '심사중';
    case 'APPROVED':
      return '승인';
    case 'REJECTED':
      return '거절';
    default:
      return '미신청';
  }
};