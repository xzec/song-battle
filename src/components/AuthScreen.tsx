import type { SVGProps } from 'react'

type AuthScreenProps = {
  onLogin: () => void
  errorMessage?: string
}

export const AuthScreen = ({ onLogin, errorMessage }: AuthScreenProps) => (
  <div className="flex min-h-screen items-center justify-center px-6 py-16">
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

const SpotifyIcon = ({
  className = 'h-6 w-6',
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)
