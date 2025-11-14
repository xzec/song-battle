import { useState } from 'react'
import { NoImage, Thumbnail } from '~/components/Thumbnail'
import { useBattle } from '~/context/BattleContext'
import type { BracketNode, Edge, Track } from '~/context/types'
import { Add } from '~/icons/Add'
import { Icon } from '~/icons/misc/Icon'
import { cn } from '~/utils/cn'
import { getLinkPath } from '~/utils/get-link-path'

type BracketProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
  bracket: BracketNode
}

const borderWidth = 1

export function Bracket({ interactive = false, bracket, className, ...props }: BracketProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { addTrackToBracket, searchRef, activeBracketId, setActiveBracketId, bracketsRef, edges } = useBattle()

  const acceptsTrack = !bracket.track && interactive
  const battleEnabled = Boolean(bracket.left?.track && bracket.right?.track)
  const isActive = bracket.id === activeBracketId

  return (
    <div
      ref={function registerRef(element) {
        if (element) bracketsRef.current[bracket.id] = element
      }}
      className="relative overflow-visible"
    >
      <div
        className={cn(
          'focus-visible:emerald-ring relative flex h-20 items-center overflow-hidden rounded-xl border-violet-300 text-sm transition',
          {
            'cursor-pointer border-dashed bg-zinc-700/30': acceptsTrack,
            'border-blue-500 border-solid bg-blue-500/10': isActive,
            'border-green-500 border-solid bg-green-500/20': isDragOver && interactive,
            'border-none bg-zinc-950 shadow-sm': bracket.track,
            className,
          },
        )}
        style={{ borderWidth: `${borderWidth}px` }}
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
          const track = JSON.parse(event.dataTransfer.getData('application/json')) as Track
          addTrackToBracket(bracket.id, track)
        }}
        {...props}
      >
        {content()}
      </div>
      <SvgEdge edge={edges?.[bracket.id]} />
    </div>
  )

  function content() {
    if (bracket.track) return <Track track={bracket.track} />

    if (interactive) {
      if (isDragOver) return <Info className="text-green-500">Release to add</Info>
      if (isActive) return <Info className="text-blue-500">Choose from search</Info>
      return (
        <Info>
          Add track
          <Icon icon={Add} className="ml-1" size="1em" inline aria-hidden />
        </Info>
      )
    }

    if (battleEnabled) return <span></span>
    return null
  }
}

function SvgEdge({ edge }: { edge: Edge | undefined }) {
  if (!edge) return null

  return (
    <svg
      aria-hidden
      width={edge.x}
      height={Math.max(Math.abs(edge.y), borderWidth)}
      className={cn('pointer-events-none absolute left-full overflow-visible fill-none stroke-violet-300', {
        'top-1/2': Math.sign(edge.y) === 1, // positive y - render edge normally
        '-scale-y-[1] bottom-1/2': Math.sign(edge.y) === -1, // negative y - render edge "upwards" + flip vertically
        '-translate-y-1/2 top-1/2': Math.sign(edge.y) === 0, // y=0 - render in the middle
      })}
      strokeWidth={`${borderWidth}`} // adjust stroke to match Bracket's border width
    >
      <path d={getLinkPath(0, 0, edge.x, Math.abs(edge.y))} />
    </svg>
  )
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

function Info({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex w-full justify-center', className)} {...props}>
      <p>{children}</p>
    </div>
  )
}
