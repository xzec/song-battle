import { Icon } from '@iconify-icon/react'
import * as Popover from '@radix-ui/react-popover'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  startTransition,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { deleteStoredSong, getStoredSongs } from '~/api/backend'
import { hitSearch } from '~/api/spotify'
import { useSpotifyAuth, useUser } from '~/auth/SpotifyAuthContext'
import { SearchItem } from '~/components/SearchItem'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'
import { cn } from '~/utils/cn'

export const Search = () => {
  const { logout, tokens, refreshTokens } = useSpotifyAuth()
  const { setActiveBracketId, searchRef } = useBattle()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [shadowOpen, setShadowOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'search' | 'avatar' | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const user = useUser()
  const queryClient = useQueryClient()
  const avatarInitial = user.display_name?.trim().charAt(0) ?? '?'
  const avatarUrl = user.images?.[0]?.url

  const { data } = useQuery({
    queryKey: ['search', query],
    queryFn: () => hitSearch(query, tokens!.accessToken, refreshTokens),
    enabled: Boolean(tokens?.accessToken && query.length),
  })

  const { data: storedSongs, refetch: refetchStoredSongs } = useQuery({
    queryKey: ['history'],
    queryFn: () => getStoredSongs(tokens!.accessToken),
    enabled: Boolean(tokens?.accessToken && !query.length),
  })

  const mutation = useMutation({
    mutationFn: async (trackId: string) => {
      await deleteStoredSong(trackId, tokens!.accessToken)
    },
    onMutate: async function optimisticUpdate(trackId: string) {
      await queryClient.cancelQueries({ queryKey: ['history'] })
      const previousHistory = queryClient.getQueryData(['history'])
      queryClient.setQueryData(['history'], (old: Track[]) =>
        old.filter((track) => track.id !== trackId),
      )
      return { previousHistory }
    },
    onError: (error, _newHistory, context) => {
      console.error(error)
      if (context?.previousHistory)
        queryClient.setQueryData(['history'], context.previousHistory)
    },
    onSuccess: () => void refetchStoredSongs(),
  })

  const openMenu = (type: 'search' | 'avatar') => {
    setShadowOpen(true)
    startTransition(() => {
      setOpen(true)
      setActiveMenu(type)
    })
  }

  const closeMenu = () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur()
    setShadowOpen(false)
    setOpen(false)
    setActiveBracketId(null)
  }

  useHotkeys('meta+k', () => searchRef?.current?.focus())
  useHotkeys('esc', closeMenu, { enableOnFormTags: true })

  return (
    <Popover.Root open={open} modal={false}>
      <Popover.Anchor asChild>
        <div
          ref={searchBarRef}
          className={cn(
            'pointer-events-auto flex flex-1 cursor-pointer items-center gap-3 rounded-full py-1 pr-1 pl-4 text-white transition',
            'group-focus-within:emerald-ring border border-white/30 hover:not-focus-within:not-active:border-white/50 group-focus-within:border-transparent',
            'bg-zinc-950/30 backdrop-blur-lg group-focus-within:bg-zinc-950/80',
            'inset-shadow-sm inset-shadow-zinc-900/25 shadow-sm shadow-zinc-900/25',
          )}
          onClick={() => {
            openMenu('search')
            searchRef.current?.focus()
          }}
        >
          <Icon
            icon="radix-icons:magnifying-glass"
            width={32}
            height={32}
            className="text-white/50"
          />
          <input
            ref={searchRef}
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
              'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-white/10 font-medium text-sm text-white/80 transition hover:text-white focus-visible:ring-0',
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
            'scrollbar-none pointer-events-auto relative z-100 animate-slide-fade rounded-4xl border border-white/10 bg-zinc-950/80 p-3 text-white shadow-lg backdrop-blur-lg',
            {
              'max-h-80 w-[calc(100vw-16px)] max-w-xl overflow-y-auto':
                activeMenu === 'search',
              'w-44': activeMenu === 'avatar',
            },
          )}
        >
          {activeMenu === 'search' ? (
            query.length && data ? (
              data?.tracks.items.map((track) => (
                <SearchItem
                  key={track.id}
                  onPick={closeMenu}
                  track={{
                    id: track.id,
                    name: track.name,
                    artist: track.artists.map((v) => v.name).join(', '),
                    image: track.album.images.at(-2)?.url,
                    imagePreview: track.album.images.at(-1)?.url,
                  }}
                />
              ))
            ) : (
              <>
                <span className="my-1 ml-2 block text-sm text-white/30">
                  Recent
                </span>
                <div className="mx-2 mb-2 h-[0.5px] bg-white/10" />
                {storedSongs?.map((track, i) => (
                  <SearchItem
                    key={i}
                    onPick={closeMenu}
                    track={track}
                    onRemove={() => mutation.mutate(track.id)}
                  />
                ))}
              </>
            )
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
    </Popover.Root>
  )
}
