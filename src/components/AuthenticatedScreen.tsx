import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'

type AuthenticatedScreenProps = {
  userName: string
  onLogout: () => void
}

export const AuthenticatedScreen = ({
  userName,
  onLogout,
}: AuthenticatedScreenProps) => {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useSpotifyAuth()

  const avatarInitial = userName.trim().charAt(0)?.toUpperCase() ?? '?'
  const avatarUrl = user?.images?.[0]?.url

  return (
    <div className="flex min-h-screen justify-center px-6 py-10">
      <div className="flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-white backdrop-blur-xl">
            <svg
              className="h-5 w-5 text-white/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                d="M21 21l-4.35-4.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="11" r="6.5" />
            </svg>
            <input
              type="search"
              placeholder="Search Spotify"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>
          <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 font-medium text-sm text-white/80 transition hover:border-white/40 hover:text-white"
                aria-label="Open account menu"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  avatarInitial
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={12}
                align="end"
                className="w-40 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-white shadow-lg backdrop-blur-xl"
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    setMenuOpen(false)
                    onLogout()
                  }}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm text-white/80 outline-none transition hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                >
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>
      </div>
    </div>
  )
}
