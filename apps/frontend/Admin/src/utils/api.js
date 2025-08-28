import { API_BASE_URL } from '../config/env'

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed')
    }
    
    return result
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const api = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' })
}