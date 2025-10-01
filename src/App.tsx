import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { AuthenticatedScreen } from '~/components/AuthenticatedScreen'
import { AuthScreen } from '~/components/AuthScreenProps'
import { LoadingScreen } from '~/components/LoadingScreen'

const App = () => {
  const { status, error, login, logout, user } = useSpotifyAuth()

  if (status === 'loading' || status === 'authenticating') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated' || status === 'error') {
    return <AuthScreen onLogin={login} errorMessage={error?.message} />
  }

  return (
    <AuthenticatedScreen
      userName={user?.display_name ?? 'Anonymous battler'}
      onLogout={logout}
    />
  )
}

export default App
