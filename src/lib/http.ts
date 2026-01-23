import ky from 'ky'

// API base URL - update this to your actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
        const token = localStorage.getItem('auth_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Handle 401 unauthorized
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          // Optionally redirect to login
        }
        return response
      },
    ],
  },
})
