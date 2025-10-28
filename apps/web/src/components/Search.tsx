import * as Popover from '@radix-ui/react-popover'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startTransition, useId, useRef, useState, ViewTransition } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { deleteStoredSong, getStoredSongs } from '~/api/backend'
import { searchTracks } from '~/api/spotify'
import { useSpotifyAuth, useUser } from '~/auth/SpotifyAuthContext'
import { SearchItem } from '~/components/SearchItem'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'
import { MagnifyingGlass } from '~/icons/MagnifyingGlass'
import { Icon } from '~/icons/misc/Icon'
import { X } from '~/icons/X'
import { cn } from '~/utils/cn'

export function Search() {
  const { logout, tokens } = useSpotifyAuth()
  const { setActiveBracketId, searchRef } = useBattle()
  const [query, setQuery] = useState('')
  const [deferredQuery] = useDebouncedValue(query, {
    wait: 175,
  })
  const [open, setOpen] = useState(false)
  const [shadowOpen, setShadowOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'search' | 'avatar' | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const user = useUser()
  const queryClient = useQueryClient()
  const avatarUrl = user.images[0].url
  const searchId = useId()

  const { data: tracks } = useQuery({
    queryKey: ['search', deferredQuery],
    queryFn: () =>
      searchTracks(deferredQuery, tokens!.accessToken, user.country),
    enabled: Boolean(tokens?.accessToken && deferredQuery.length),
    placeholderData: (previousData) => previousData,
  })

  const { data: recentTracks, refetch: refetchRecentTracks } = useQuery({
    queryKey: ['history'],
    queryFn: () => getStoredSongs(tokens!.accessToken),
    enabled: Boolean(tokens?.accessToken && !query.length),
  })

  const removeFromRecent = useMutation({
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
    onSuccess: () => void refetchRecentTracks(),
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
        <search
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
          <label htmlFor={searchId}>
            <Icon
              icon={MagnifyingGlass}
              title="Search Spotify"
              size={32}
              className="text-white/50"
            />
          </label>
          <input
            id={searchId}
            ref={searchRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Search Spotify"
            value={query}
            onFocus={() => openMenu('search')}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 not-focus-visible:cursor-pointer bg-transparent font-medium text-lg text-white placeholder:text-white/50 focus:outline-none"
          />
          {query.length ? (
            <button
              type="button"
              aria-label="Clear search"
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-white/50 transition-opacity hover:text-white',
              )}
              onClick={() => setQuery('')}
            >
              <Icon icon={X} aria-hidden size={20} />
            </button>
          ) : (
            <>
              <kbd
                className={cn(
                  'win:hidden rounded-md border border-white/30 px-1 font-bold font-sans text-white/30 text-xs leading-[20px] tracking-wide transition-opacity',
                  shadowOpen ? 'opacity-0' : 'opacity-100',
                )}
              >
                ⌘K
              </kbd>
              <kbd
                className={cn(
                  'mac:hidden rounded-md border border-white/30 px-1 font-bold font-sans text-white/30 text-xs leading-[20px] tracking-tight transition-opacity',
                  shadowOpen ? 'opacity-0' : 'opacity-100',
                )}
              >
                Ctrl K
              </kbd>
            </>
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
            <img
              src={avatarUrl}
              alt="Spotify avatar"
              className="pointer-events-none h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        </search>
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
            'scrollbar-none pointer-events-auto relative z-100 animate-slide-fade rounded-4xl border border-white/10 bg-zinc-950 p-3 text-white shadow-lg',
            {
              'max-h-80 w-[calc(100vw-16px)] max-w-xl overflow-y-auto':
                activeMenu === 'search',
              'w-44': activeMenu === 'avatar',
            },
          )}
        >
          {activeMenu === 'search' ? (
            <output htmlFor={searchId}>
              {query.length ? (
                <ListOfTracks tracks={tracks} onPick={closeMenu} />
              ) : (
                <>
                  <h2 className="my-1 ml-2 block text-sm text-white/40">
                    Recent
                  </h2>
                  <div className="mx-2 mb-2 h-[0.5px] bg-white/10" />
                  <ListOfTracks
                    tracks={recentTracks}
                    onPick={closeMenu}
                    onRemove={removeFromRecent.mutate}
                  />
                </>
              )}
            </output>
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

function ListOfTracks({
  tracks,
  onPick,
  onRemove,
}: {
  tracks: Track[] | undefined
  onPick: () => void
  onRemove?: (trackId: string) => void
}) {
  if (!tracks?.length) return 'No results'

  return (
    <ul>
      {tracks?.map((track) => (
        <li key={track.id}>
          <SearchItem
            onPick={onPick}
            track={track}
            onRemove={
              typeof onRemove === 'function'
                ? () => onRemove(track.id)
                : undefined
            }
          />
        </li>
      ))}
    </ul>
  )
}
