import { apiClient, handleApiError } from './api';
import { Scholarship } from './scholarship.api';

// 북마크 API 서비스
export const bookmarkApi = {
  // 북마크 추가
  async addBookmark(scholarshipId: number): Promise<boolean> {
    try {
      const response = await apiClient.post(`/bookmarks/${scholarshipId}`);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '찜하기에 실패했습니다.');
      return false;
    }
  },

  // 북마크 제거
  async removeBookmark(scholarshipId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/bookmarks/${scholarshipId}`);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '찜하기 해제에 실패했습니다.');
      return false;
    }
  },

  // 북마크 토글 (추가/제거)
  async toggleBookmark(scholarshipId: number): Promise<boolean> {
    try {
      const response = await apiClient.post(`/bookmarks/${scholarshipId}/toggle`);
      
      console.log('🔖 Bookmark toggle response:', response);
      
      if (response.success && response.data) {
        if (response.data.data && typeof response.data.data.isBookmarked === 'boolean') {
          return response.data.data.isBookmarked;
        } else if (typeof response.data.isBookmarked === 'boolean') {
          return response.data.isBookmarked;
        }
      }
      return false;
    } catch (error) {
      handleApiError(error, '찜하기 처리에 실패했습니다.');
      return false;
    }
  },

  // 북마크 여부 확인
  async isBookmarked(scholarshipId: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/bookmarks/${scholarshipId}/check`);
      
      if (response.success && response.data) {
        if (response.data.data && typeof response.data.data.isBookmarked === 'boolean') {
          return response.data.data.isBookmarked;
        } else if (typeof response.data.isBookmarked === 'boolean') {
          return response.data.isBookmarked;
        }
      }
      return false;
    } catch (error) {
      console.error('북마크 상태 확인 실패:', error);
      return false;
    }
  },

  // 내 북마크한 장학금 목록 조회
  async getMyBookmarks(): Promise<Scholarship[]> {
    try {
      const response = await apiClient.get<Scholarship[]>('/bookmarks/my');
      
      console.log('🔖 Bookmark list response:', response);
      
      if (response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Bookmark data is in data.data array');
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('✅ Bookmark data is direct array');
          return response.data;
        }
        return response.data;
      } else if (Array.isArray(response.data)) {
        console.log('✅ Using direct bookmark array response');
        return response.data;
      }
      
      console.log('❌ No valid bookmark response structure found');
      return [];
    } catch (error) {
      handleApiError(error, '찜목록을 불러오는데 실패했습니다.');
      return [];
    }
  },

  // 내 북마크 수 조회
  async getMyBookmarkCount(): Promise<number> {
    try {
      const response = await apiClient.get('/bookmarks/my/count');
      
      if (response.success && response.data) {
        if (response.data.data && typeof response.data.data.count === 'number') {
          return response.data.data.count;
        } else if (typeof response.data.count === 'number') {
          return response.data.count;
        }
      }
      return 0;
    } catch (error) {
      console.error('북마크 수 조회 실패:', error);
      return 0;
    }
  }
};