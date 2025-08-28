import { apiClient, handleApiError } from './api';

// 사용자 정보 관련 타입 정의
export interface UserInfo {
  userNm: string;
  userId: string;
  userName: string;
  accountNm?: string;
  grade: number;
  gpa?: number;
  role: string;
  deptNm: number;
  collegeNm: number;
  univNm: number;
}

export interface UserInfoUpdateRequest {
  userName?: string;
  deptNm?: number;
  collegeNm?: number;
  univNm?: number;
  grade?: number;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 사용자 API 서비스
export const userApi = {
  // 내 정보 조회
  async getMyInfo(): Promise<UserInfo | null> {
    try {
      const response = await apiClient.get<UserInfo>('/user/me');
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '사용자 정보 조회에 실패했습니다.');
      return null;
    }
  },

  // 내 정보 수정
  async updateMyInfo(updateData: UserInfoUpdateRequest): Promise<UserInfo | null> {
    try {
      const response = await apiClient.post<UserInfo>('/user/update', updateData);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '사용자 정보 수정에 실패했습니다.');
      return null;
    }
  },

  // 비밀번호 변경
  async changePassword(passwordData: PasswordChangeRequest): Promise<boolean> {
    try {
      const response = await apiClient.post<void>('/user/password/change', passwordData);
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, '비밀번호 변경에 실패했습니다.');
      return false;
    }
  }
};