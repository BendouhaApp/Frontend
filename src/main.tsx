import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Initialize i18n before rendering
import './i18n'

import './index.css'
import App from './App.tsx'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const AppTree = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(30 15% 99%)',
          border: '1px solid hsl(30 8% 88%)',
          color: 'hsl(30 10% 12%)',
        },
      }}
    />
  </QueryClientProvider>
)

createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? AppTree : <StrictMode>{AppTree}</StrictMode>,
)
