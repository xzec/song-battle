import { Icon } from '@iconify-icon/react'
import { useState } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { Bracket as BracketType, Track } from '~/context/types'
import { cn } from '~/utils/cn'

interface BracketProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  bracketId: string
  track: Track | null
  prevA?: BracketType | null | undefined
  prevB?: BracketType | null | undefined
}

export const Bracket = ({
  interactive = false,
  bracketId,
  track,
  className,
  prevA,
  prevB,
  ...props
}: BracketProps) => {
  const { searchRef } = useBattle()
  const [isOver, setIsOver] = useState(false)
  const { addTrackToBracket, activeBracketId, setActiveBracketId } = useBattle()

  const canBattle = Boolean(prevA?.track && prevB?.track)

  return (
    <div
      className={cn(
        'flex h-20 w-72 items-center overflow-hidden rounded-xl border-2 border-zinc-500 border-dashed bg-zinc-700/20 text-sm shadow-lg transition',
        {
          'border-blue-500 bg-zinc-400/30': bracketId === activeBracketId,
          'border border-zinc-700 border-solid bg-zinc-950': track,
          'border-green-500': isOver,
          'cursor-pointer justify-center': !track && interactive,
          className,
        },
      )}
      onClick={() => {
        if (track || !interactive) return
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
            <img
              src={track.image}
              alt=""
              className="pointer-events-none h-full select-none"
            />
          ) : (
            <div className="size-12">No image</div>
          )}
          <div className="flex h-full flex-col p-2">
            <span>{track?.name}</span>
            <span className="text-white/50">{track?.artist}</span>
          </div>
        </>
      ) : interactive ? (
        <div className="flex items-center gap-1 text-white/50">
          <span>Add track</span>
          <Icon icon="icon-park-outline:add-one" />
        </div>
      ) : canBattle ? (
        'do it'
      ) : null}
    </div>
  )
}
