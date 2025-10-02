import { Icon } from '@iconify-icon/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRef, useState } from 'react'
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
  const inputRef = useRef<HTMLInputElement>(null)

  const avatarInitial = userName.trim().charAt(0)?.toUpperCase() ?? '?'
  const avatarUrl = user?.images?.[0]?.url

  return (
    <div className="flex min-h-screen justify-center p-2">
      <div className="flex w-full max-w-4xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <div
            className="flex flex-1 cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pr-1 pl-4 text-white ring-emerald-500 backdrop-blur-xl focus-within:border-transparent focus-within:bg-white/15 focus-within:ring-2"
            onClick={() => inputRef.current?.focus()}
          >
            <Icon
              icon="radix-icons:magnifying-glass"
              width={32}
              height={32}
              className="text-white/50"
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search Spotify"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 not-focus-visible:cursor-pointer bg-transparent font-medium text-lg text-white placeholder:text-white/50 focus:outline-none"
            />
            <span className="font-mono text-white/50">
              <Icon
                inline
                icon="qlementine-icons:key-cmd-16"
                className="mr-0.5"
              />
              <span>K</span>
            </span>
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
                  onCloseAutoFocus={(event) => {
                    event.preventDefault()
                    inputRef.current?.focus()
                  }}
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
          </div>
        </header>
      </div>
    </div>
  )
}
