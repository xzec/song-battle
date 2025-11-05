import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '~/App'
import { SpotifyAuthProvider } from '~/auth/SpotifyAuthProvider'

const ONE_DAY = 1000 * 60 * 60 * 24

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: ONE_DAY,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SpotifyAuthProvider>
        <App />
      </SpotifyAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
