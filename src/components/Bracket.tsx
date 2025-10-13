import { Icon } from '@iconify-icon/react'
import { type RefObject, useState } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'
import { cn } from '~/utils/cn'

interface BracketProps extends React.HTMLAttributes<HTMLDivElement> {
  bracketId: string
  track: Track | null
  searchRef: RefObject<HTMLInputElement | null>
}

export const Bracket = ({
  bracketId,
  track,
  searchRef,
  ...props
}: BracketProps) => {
  const [isOver, setIsOver] = useState(false)
  const { addTrackToBracket, activeBracketId, setActiveBracketId } = useBattle()

  return (
    <div
      className={cn(
        'flex h-24 w-80 items-center overflow-hidden rounded-xl border-2 border-zinc-500 border-dashed bg-zinc-300/20 text-sm shadow-lg transition',
        {
          'border-blue-500 bg-zinc-300/30': activeBracketId === bracketId,
          'border-green-500': isOver,
          'border border-zinc-700 border-solid bg-zinc-900': track,
          'cursor-pointer justify-center': !track,
        },
      )}
      onClick={() => {
        if (track) return
        setActiveBracketId(bracketId)
        searchRef.current?.focus()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false)
        const track = JSON.parse(
          e.dataTransfer.getData('application/json'),
        ) as Track
        addTrackToBracket(bracketId, track)
      }}
      {...props}
    >
      {track ? (
        <>
          {track?.image ? (
            <img src={track.image} alt="" className="h-full" />
          ) : (
            <div className="size-12">No image</div>
          )}
          <div className="flex h-full flex-col p-2">
            <span>{track?.name}</span>
            <span className="text-white/50">{track?.artist}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1 text-white/50">
          <span>Add track</span>
          <Icon icon="icon-park-outline:add-one" />
        </div>
      )}
    </div>
  )
}
