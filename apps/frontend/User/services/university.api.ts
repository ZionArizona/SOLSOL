import { apiClient, handleApiError } from './api';

// 대학 관련 타입 정의
export interface University {
  univNm: number;
  name: string;
}

export interface College {
  collegeNm: number;
  name: string;
  univNm: number;
}

export interface Department {
  deptNm: number;
  name: string;
  collegeNm: number;
}

export interface UniversityHierarchy {
  university: University;
  colleges: (College & {
    departments: Department[];
  })[];
}

// 대학 API 서비스
export const universityApi = {
  // 대학 목록 조회
  async getUniversities(): Promise<University[] | null> {
    try {
      const response = await apiClient.get<University[]>('/universities');
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '대학 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 특정 대학의 단과대 목록 조회
  async getColleges(universityId: number): Promise<College[] | null> {
    try {
      const response = await apiClient.get<College[]>(`/universities/${universityId}/colleges`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '단과대 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 특정 단과대의 학과 목록 조회
  async getDepartments(collegeId: number): Promise<Department[] | null> {
    try {
      const response = await apiClient.get<Department[]>(`/colleges/${collegeId}/departments`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '학과 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 대학 계층 구조 조회 (대학 > 단과대 > 학과)
  async getUniversityHierarchy(universityId: number): Promise<UniversityHierarchy | null> {
    try {
      const response = await apiClient.get<UniversityHierarchy>(`/universities/${universityId}/hierarchy`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '대학 구조 정보를 불러오는데 실패했습니다.');
      return null;
    }
  },

  // 소속 정보 검색 (자동완성용)
  async searchAffiliations(query: string): Promise<{
    universities: University[];
    colleges: College[];
    departments: Department[];
  } | null> {
    try {
      const response = await apiClient.get<{
        universities: University[];
        colleges: College[];
        departments: Department[];
      }>(`/affiliations/search?q=${encodeURIComponent(query)}`);
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleApiError(error, '소속 정보 검색에 실패했습니다.');
      return null;
    }
  }
};