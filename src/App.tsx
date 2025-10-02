import type { ReactNode } from 'react'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { AuthenticatedScreen } from '~/components/AuthenticatedScreen'
import { AuthScreen } from '~/components/AuthScreen'
import { Layout } from '~/components/Layout'
import { LoadingScreen } from '~/components/LoadingScreen'

const App = () => {
  const { status, error, login, logout, user } = useSpotifyAuth()

  let content: ReactNode

  if (status === 'loading' || status === 'authenticating') {
    content = <LoadingScreen />
  } else if (status === 'unauthenticated' || status === 'error') {
    content = <AuthScreen onLogin={login} errorMessage={error?.message} />
  } else {
    content = (
      <AuthenticatedScreen
        userName={user?.display_name ?? 'Anonymous battler'}
        onLogout={logout}
      />
    )
  }

  return <Layout>{content}</Layout>
}

export default App
