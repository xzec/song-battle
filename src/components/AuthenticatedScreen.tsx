import { Icon } from '@iconify-icon/react'
import * as Popover from '@radix-ui/react-popover'
import {
  startTransition,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { cn } from '~/utils/cn'

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
  const [activeMenu, setActiveMenu] = useState<'search' | 'avatar' | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)

  const { user } = useSpotifyAuth()
  const avatarInitial = userName.trim().charAt(0)?.toUpperCase() ?? '?'
  const avatarUrl = user?.images?.[0]?.url

  const openMenu = (kind: 'search' | 'avatar') => {
    startTransition(() => {
      setActiveMenu(kind)
      setMenuOpen(true)
    })
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setActiveMenu(null)
    onLogout()
  }

  return (
    <div className="flex min-h-screen justify-center p-2">
      <div className="flex w-full max-w-4xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <Popover.Root open={menuOpen} modal={false}>
            <Popover.Anchor asChild>
              <div
                ref={searchBarRef}
                className={cn(
                  'focus-within:emerald-ring flex flex-1 cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pr-1 pl-4 text-white ring-emerald-500 backdrop-blur-xl focus-within:border-transparent focus-within:bg-white/15 hover:not-focus-within:not-active:border-white/40 active:border-transparent',
                  'inset-shadow-sm inset-shadow-zinc-900/20 shadow-md shadow-zinc-900/15',
                  {
                    'emerald-ring border-transparent bg-white/15': menuOpen,
                  },
                )}
                onClick={() => {
                  openMenu('search')
                  inputRef.current?.focus()
                }}
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
                  onFocus={() => openMenu('search')}
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

                <button
                  ref={avatarRef}
                  type="button"
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 font-medium text-sm text-white/80 ring-emerald-500 transition hover:border-white/40 hover:text-white focus-visible:border-white/80 focus-visible:ring-0"
                  aria-label="Open account menu"
                  onClick={(event) => {
                    event.stopPropagation()
                    openMenu('avatar')
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="pointer-events-none h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    avatarInitial
                  )}
                </button>
              </div>
            </Popover.Anchor>
            <ViewTransition>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={12}
                collisionPadding={12}
                onInteractOutside={(event) => {
                  if (
                    [
                      inputRef.current,
                      searchBarRef.current,
                      avatarRef.current,
                    ].some((el) => el === event.target)
                  )
                    return
                  setMenuOpen(false)
                }}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => event.preventDefault()}
                className={cn(
                  'relative rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-white shadow-lg backdrop-blur-xl',
                  'animate-slide-fade',
                  {
                    'max-h-80 w-[min(32rem,_calc(100vw-3rem))] overflow-y-auto':
                      activeMenu === 'search',
                    'w-44': activeMenu === 'avatar',
                  },
                )}
              >
                {activeMenu === 'search' ? (
                  <div className="space-y-2 text-sm text-white/80">
                    {[
                      'Avalanche',
                      'Having Our Way (feat. Drake)',
                      'Straightenin',
                      'Type Shit (feat. Cardi B)',
                      'Malibu (feat. Polo G)',
                      'Birthday',
                      'Modern Day',
                      'Vaccine',
                      'Picasso (feat. Future)',
                      'Roadrunner',
                      'What You See (feat. Justin Bieber)',
                      'Jane',
                      'Antisocial (feat. Juice WRLD)',
                      'Why Not',
                      'Mahomes',
                      'Handle My Business',
                      'Time For Me',
                      'Light It Up (feat. Pop Smoke)',
                      'Need It (feat. YoungBoy Never Broke Again)',
                    ].map((el, i) => (
                      <button
                        key={i}
                        className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/10 hover:text-white"
                      >
                        {el}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl px-4 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Log out
                  </button>
                )}
              </Popover.Content>
            </ViewTransition>
          </Popover.Root>
        </header>
      </div>
    </div>
  )
}
