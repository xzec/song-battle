import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '~/App.tsx'
import { SpotifyAuthProvider } from '~/auth/SpotifyAuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpotifyAuthProvider>
      <App />
    </SpotifyAuthProvider>
  </StrictMode>,
)
