import { Icon } from '@iconify-icon/react'
import * as Popover from '@radix-ui/react-popover'
import { useQuery } from '@tanstack/react-query'
import {
  type RefObject,
  startTransition,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSpotifyAuth, useUser } from '~/auth/SpotifyAuthContext'
import { SearchItem } from '~/components/SearchItem'
import { useBattle } from '~/context/BattleContext'
import { cn } from '~/utils/cn'

type SpotifyTrackSearchResponse = {
  tracks: {
    items: Array<{
      id: string
      name: string
      artists: Array<{
        name: string
      }>
      album: {
        images: Array<{
          url: string
        }>
      }
    }>
  }
}

const hitSearch = async (query: string, accessToken: string) => {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    market: 'US',
    limit: '10',
  })

  const url = `https://api.spotify.com/v1/search?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await res.json()
  return data as SpotifyTrackSearchResponse
}

type SearchProps = {
  ref: RefObject<HTMLInputElement | null>
}

export const Search = ({ ref }: SearchProps) => {
  const { setActiveBracketId } = useBattle()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [shadowOpen, setShadowOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'search' | 'avatar' | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const disposeRef = useRef<HTMLDivElement>(null)
  const { logout, tokens } = useSpotifyAuth()
  const user = useUser()
  const avatarInitial = user.display_name?.trim().charAt(0) ?? '?'
  const avatarUrl = user.images?.[0]?.url

  const { data } = useQuery({
    queryKey: ['search', query],
    queryFn: () => hitSearch(query, tokens!.accessToken),
    enabled: Boolean(tokens?.accessToken && query.length),
  })

  useHotkeys('meta+k', () => ref?.current?.focus())
  useHotkeys('esc', () => disposeRef?.current?.focus(), {
    enableOnFormTags: true,
  })

  const openMenu = (type: 'search' | 'avatar') => {
    setShadowOpen(true)
    startTransition(() => {
      setOpen(true)
      setActiveMenu(type)
    })
  }

  const closeMenu = () => {
    setShadowOpen(false)
    setOpen(false)
    setActiveBracketId(null)
  }

  return (
    <Popover.Root open={open} modal={false}>
      <Popover.Anchor asChild>
        <div
          ref={searchBarRef}
          className={cn(
            'focus-within:emerald-ring flex flex-1 cursor-pointer items-center gap-3 rounded-full py-1 pr-1 pl-4 text-white transition',
            'border border-white/10 focus-within:border-transparent hover:not-focus-within:not-active:border-white/30',
            'bg-zinc-900/40 focus-within:bg-zinc-950/80',
            'inset-shadow-sm inset-shadow-zinc-900/40 shadow-md shadow-zinc-900/25',
            {
              'emerald-ring border-transparent bg-zinc-950/80': open,
            },
          )}
          onClick={() => {
            openMenu('search')
            ref.current?.focus()
          }}
        >
          <Icon
            icon="radix-icons:magnifying-glass"
            width={32}
            height={32}
            className="text-white/50"
          />
          <input
            ref={ref}
            placeholder="Search Spotify"
            value={query}
            onFocus={() => openMenu('search')}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 not-focus-visible:cursor-pointer bg-transparent font-medium text-lg text-white placeholder:text-white/50 focus:outline-none"
          />
          {query.length ? (
            <button
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-white/50 transition-opacity hover:text-white',
              )}
              onClick={() => setQuery('')}
            >
              <Icon icon="ic:baseline-clear" width={20} height={20} inline />
            </button>
          ) : (
            <span
              className={cn(
                'rounded-md border border-white/30 px-1 py-0.5 font-bold font-mono text-white/30 text-xs transition-opacity',
                shadowOpen ? 'opacity-0' : 'opacity-100',
              )}
            >
              <Icon inline icon="bx:command" className="mr-0.5" />
              <kbd>K</kbd>
            </span>
          )}
          <button
            type="button"
            className={cn(
              'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-white/10 font-medium text-sm text-white/80 ring-emerald-500 transition hover:text-white focus-visible:ring-0',
              'border-white/10 hover:border-white/30 focus-visible:border-white/80',
            )}
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
              <span className="uppercase">{avatarInitial}</span>
            )}
          </button>
        </div>
      </Popover.Anchor>
      <ViewTransition>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={8}
          onInteractOutside={(event) => {
            if (searchBarRef.current?.contains(event.target as Node)) return
            closeMenu()
          }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'scrollbar-none relative z-100 animate-slide-fade rounded-4xl border border-white/10 bg-zinc-950/70 p-3 text-white shadow-lg backdrop-blur-xl',
            {
              'max-h-80 w-[calc(100vw-16px)] max-w-4xl overflow-y-auto':
                activeMenu === 'search',
              'w-44': activeMenu === 'avatar',
              hidden: activeMenu === 'search' && !data,
            },
          )}
        >
          {activeMenu === 'search' ? (
            data?.tracks.items.map((track) => (
              <SearchItem
                key={track.id}
                onPick={closeMenu}
                imagePreview={track.album.images.at(-1)?.url}
                track={{
                  image: track.album.images.at(-2)?.url,
                  name: track.name,
                  artist: track.artists.map((v) => v.name).join(', '),
                }}
              />
            ))
          ) : (
            <button
              onClick={logout}
              className="w-full rounded-xl px-4 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Log out
            </button>
          )}
        </Popover.Content>
      </ViewTransition>
      <div tabIndex={1} ref={disposeRef} />
    </Popover.Root>
  )
}
