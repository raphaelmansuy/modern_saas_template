/**
 * API utility functions for consistent API calls
 */

const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

export const apiClient = {
  get: async (endpoint: string, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
  },

  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  delete: async (endpoint: string, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
  },
}

export { getApiUrl }
