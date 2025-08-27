import { apiClient, handleApiError } from './api';
import { Scholarship } from './scholarship.api';

// 북마크 API 서비스
export const bookmarkApi = {
  // 북마크 추가
  async addBookmark(scholarshipId: number): Promise<boolean> {
    try {
      console.log('🔖 Adding bookmark for scholarshipId:', scholarshipId);
      const response = await apiClient.post(`/bookmarks/scholarships/${scholarshipId}`);
      console.log('🔖 Add bookmark response:', response);
      
      if (response.success) {
        console.log('🔖 Bookmark added successfully');
        return true;
      }
      console.log('🔖 Bookmark add failed - response not successful');
      return false;
    } catch (error) {
      console.error('🔖 Add bookmark error:', error);
      // 500 에러여도 실제로는 성공할 수 있으므로 알림 제거
      return false;
    }
  },

  // 북마크 제거
  async removeBookmark(scholarshipId: number): Promise<boolean> {
    try {
      console.log('🔖 Removing bookmark for scholarshipId:', scholarshipId);
      const response = await apiClient.delete(`/bookmarks/scholarships/${scholarshipId}`);
      console.log('🔖 Remove bookmark response:', response);
      
      if (response.success) {
        console.log('🔖 Bookmark removed successfully');
        return true;
      }
      console.log('🔖 Bookmark remove failed - response not successful');
      return false;
    } catch (error) {
      console.error('🔖 Remove bookmark error:', error);
      // 500 에러여도 실제로는 성공할 수 있으므로 알림 제거
      return false;
    }
  },

  // 북마크 토글 (추가/제거) - 백엔드에 토글 API가 없으므로 수동 구현
  async toggleBookmark(scholarshipId: number): Promise<boolean> {
    try {
      console.log('🔖 Toggle bookmark for scholarshipId:', scholarshipId);
      
      const isCurrentlyBookmarked = await this.isBookmarked(scholarshipId);
      console.log('🔖 Currently bookmarked:', isCurrentlyBookmarked);
      
      if (isCurrentlyBookmarked) {
        console.log('🔖 Removing bookmark...');
        await this.removeBookmark(scholarshipId);
        console.log('🔖 Bookmark removed successfully');
        return false;
      } else {
        console.log('🔖 Adding bookmark...');
        await this.addBookmark(scholarshipId);
        console.log('🔖 Bookmark added successfully');
        return true;
      }
    } catch (error) {
      console.error('🔖 Toggle bookmark error:', error);
      handleApiError(error, '찜하기 처리에 실패했습니다.');
      return false;
    }
  },

  // 북마크 여부 확인
  async isBookmarked(scholarshipId: number): Promise<boolean> {
    try {
      console.log('🔖 Checking bookmark status for scholarshipId:', scholarshipId);
      const response = await apiClient.get(`/bookmarks/scholarships/${scholarshipId}/status`);
      console.log('🔖 Bookmark status response:', response);
      
      if (response.success && typeof response.data === 'boolean') {
        console.log('🔖 Bookmark status data:', response.data);
        return response.data;
      }
      console.log('🔖 Invalid response format or not success, returning false');
      return false;
    } catch (error) {
      console.error('🔖 북마크 상태 확인 실패:', error);
      return false;
    }
  },

  // 내 북마크한 장학금 목록 조회
  async getMyBookmarks(): Promise<Scholarship[]> {
    try {
      const response = await apiClient.get<Scholarship[]>('/bookmarks/my-scholarships');
      
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
      const response = await apiClient.get('/bookmarks/count');
      
      if (response.success && typeof response.data === 'number') {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error('북마크 수 조회 실패:', error);
      return 0;
    }
  }
};