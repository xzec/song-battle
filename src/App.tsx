import type { ReactNode } from 'react'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { AuthScreen } from '~/components/AuthScreen'
import { Battle } from '~/components/Battle'
import { Layout } from '~/components/Layout'
import { LoadingScreen } from '~/components/LoadingScreen'

const App = () => {
  const { status } = useSpotifyAuth()

  let content: ReactNode

  if (status === 'loading' || status === 'authenticating') {
    content = <LoadingScreen />
  } else if (status === 'unauthenticated' || status === 'error') {
    content = <AuthScreen />
  } else {
    content = <Battle />
  }

  return <Layout>{content}</Layout>
}

export default App
