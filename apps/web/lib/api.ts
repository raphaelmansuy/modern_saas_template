/**
 * API utility functions for consistent API calls
 */

const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

export const apiClient = {
  get: async (endpoint: string, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    const headers = new Headers()
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value as string)
      }
    }
    return fetch(url, {
      method: 'GET',
      headers,
      ...options,
    })
  },

  post: async (endpoint: string, data?: unknown, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value as string)
      }
    }
    return fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  put: async (endpoint: string, data?: unknown, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value as string)
      }
    }
    return fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  },

  delete: async (endpoint: string, options?: RequestInit) => {
    const url = `${getApiUrl()}${endpoint}`
    const headers = new Headers()
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value as string)
      }
    }
    return fetch(url, {
      method: 'DELETE',
      headers,
      ...options,
    })
  },
}

export { getApiUrl }
