import { type RefCallback, useCallback, useState } from 'react'
import { NoImage, Thumbnail } from '~/components/Thumbnail'
import { useBattle } from '~/context/BattleContext'
import type { BracketNode, Track } from '~/context/types'
import { Add } from '~/icons/Add'
import { Icon } from '~/icons/misc/Icon'
import { cn } from '~/utils/cn'

type BracketProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
  bracket: BracketNode
}

export function Bracket({
  interactive = false,
  bracket,
  className,
  ...props
}: BracketProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const {
    addTrackToBracket,
    searchRef,
    registerBracketRect,
    activeBracketId,
    setActiveBracketId,
  } = useBattle()

  const acceptsTrack = !bracket.track && interactive
  const battleEnabled = Boolean(bracket.left?.track && bracket.right?.track)
  const isActive = bracket.id === activeBracketId

  const ref = useCallback<RefCallback<HTMLDivElement>>(
    (element) => {
      if (!element) return
      registerBracketRect(bracket.id, element.getBoundingClientRect())
    },
    [bracket.id, registerBracketRect],
  )

  return (
    <div
      ref={ref}
      className={cn(
        'focus-visible:emerald-ring relative flex h-20 items-center overflow-hidden rounded-xl border border-violet-300 text-sm transition',
        {
          'cursor-pointer border-dashed bg-zinc-700/30': acceptsTrack,
          'border-blue-500 border-solid bg-blue-500/10': isActive,
          'border-green-500 border-solid bg-green-500/20':
            isDragOver && interactive,
          'border-none bg-zinc-950 shadow-sm': bracket.track,
          className,
        },
      )}
      role={acceptsTrack ? 'button' : undefined}
      tabIndex={acceptsTrack ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          setActiveBracketId(bracket.id)
          searchRef.current?.focus()
        }
      }}
      onClick={() => {
        if (!acceptsTrack) return
        setActiveBracketId(bracket.id)
        searchRef.current?.focus()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = interactive ? 'copy' : 'none'
        setIsDragOver(true)
      }}
      onDragLeave={() => {
        setIsDragOver(false)
      }}
      onDrop={(event) => {
        setIsDragOver(false)
        if (!interactive) return
        const track = JSON.parse(
          event.dataTransfer.getData('application/json'),
        ) as Track
        addTrackToBracket(bracket.id, track)
      }}
      {...props}
    >
      {content()}
    </div>
  )

  function content() {
    if (bracket.track) return <Track track={bracket.track} />

    if (interactive) {
      if (isDragOver)
        return <span className="text-green-500">Release to add</span>
      if (isActive)
        return <span className="text-blue-500">Choose from search</span>
      return (
        <>
          <span>Add track</span>
          <Icon icon={Add} className="ml-1" size="1em" inline aria-hidden />
        </>
      )
    }

    if (battleEnabled) return <span></span>
    return null
  }
}

function Track({ track }: { track: Track }) {
  return (
    <>
      <Thumbnail src={track.image} alt={track.name} size={80}>
        <NoImage className="aspect-square h-full" size={40} />
      </Thumbnail>
      <div className="flex h-full flex-col p-2">
        <span>{track.name}</span>
        <span className="text-white/50">{track.artist}</span>
      </div>
    </>
  )
}
