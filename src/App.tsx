import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { SpotifyAuthProvider } from '~/auth/SpotifyAuthProvider'

const App = () => (
  <SpotifyAuthProvider>
    <RootView />
  </SpotifyAuthProvider>
)

const RootView = () => {
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

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500 via-slate-900 to-slate-950 text-white">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      <p className="text-sm text-white/80">Connecting to Spotify…</p>
    </div>
  </div>
)

type AuthScreenProps = {
  onLogin: () => void
  errorMessage?: string
}

const AuthScreen = ({ onLogin, errorMessage }: AuthScreenProps) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/40 via-slate-900 to-slate-950 px-6 py-16 text-white">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/60 p-10 shadow-2xl backdrop-blur-xl">
      <span className="inline-flex items-center gap-2 text-sm text-white/60 uppercase tracking-[0.3em]">
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        Song Battle
      </span>
      <h1 className="mt-5 font-semibold text-3xl text-white leading-tight md:text-4xl">
        Sign in with Spotify to start the tournament
      </h1>
      <p className="mt-3 text-white/70">
        We use your Spotify account to pull in the tracks and playlists you
        love. No passwords are stored, everything stays on your device.
      </p>
      {errorMessage && (
        <div className="mt-6 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {errorMessage}
        </div>
      )}
      <button
        onClick={onLogin}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-emerald-500 px-6 py-3 font-medium text-base text-black transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
      >
        <SpotifyIcon className="h-5 w-5" />
        Continue with Spotify
      </button>
      <p className="mt-6 text-white/40 text-xs">
        By continuing you agree to let Song Battle access your Spotify profile
        &amp; playlists to build the bracket. You can revoke access anytime from
        your Spotify account.
      </p>
    </div>
  </div>
)

type AuthenticatedScreenProps = {
  userName: string
  onLogout: () => void
}

const AuthenticatedScreen = ({
  userName,
  onLogout,
}: AuthenticatedScreenProps) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 text-white">
    <header className="flex items-center justify-between px-8 py-6">
      <div>
        <p className="text-sm text-white/50 uppercase tracking-[0.3em]">
          Song Battle
        </p>
        <h2 className="mt-2 font-semibold text-2xl text-white">
          Welcome, {userName}
        </h2>
      </div>
      <button
        onClick={onLogout}
        className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
      >
        Log out
      </button>
    </header>
    <main className="px-8 pb-16">
      <div className="mt-12 max-w-2xl rounded-3xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl">
        <h3 className="font-semibold text-2xl text-white">
          Tournament bracket coming next
        </h3>
        <p className="mt-3 text-white/70">
          You are authenticated with Spotify. Next step is to let you pick
          playlists or tracks to seed the bracket. Sit tight while we finish
          wiring the battle experience.
        </p>
      </div>
    </main>
  </div>
)

type SpotifyIconProps = {
  className?: string
}

const SpotifyIcon = ({ className = 'h-6 w-6' }: SpotifyIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 1.5a10.5 10.5 0 1 0 10.5 10.5A10.5 10.5 0 0 0 12 1.5Zm4.617 15.077a.75.75 0 0 1-1.033.241 8.355 8.355 0 0 0-7.056-.77.75.75 0 1 1-.492-1.416 9.853 9.853 0 0 1 8.32.908.75.75 0 0 1 .261 1.037ZM17.4 13.1a.94.94 0 0 1-1.298.302 10.66 10.66 0 0 0-8.978-1.154.94.94 0 0 1-.545-1.8 12.54 12.54 0 0 1 10.55 1.345.94.94 0 0 1 .27 1.307Zm.126-2.99a1.13 1.13 0 0 1-1.56.363 12.98 12.98 0 0 0-10.858-1.414 1.13 1.13 0 0 1-.61-2.175 15.25 15.25 0 0 1 12.756 1.676 1.13 1.13 0 0 1 .272 1.55Z" />
  </svg>
)

export default App
