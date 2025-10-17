import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '~/App'
import { SpotifyAuthProvider } from '~/auth/SpotifyAuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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
