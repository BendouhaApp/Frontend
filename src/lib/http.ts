import ky from 'ky'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api");

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token if available
        if (typeof window === 'undefined') return
        const token =
          localStorage.getItem('access_token') ??
          localStorage.getItem('auth_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Handle 401 unauthorized
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('auth_token')
          }
          // Optionally redirect to login
        }
        return response
      },
    ],
  },
})

