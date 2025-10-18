import { Icon } from '@iconify-icon/react'
import { useState } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { BracketNode, Track } from '~/context/types'
import { cn } from '~/utils/cn'

interface BracketProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  bracket: BracketNode
}

export const Bracket = ({
  interactive = false,
  bracket,
  className,
  ...props
}: BracketProps) => {
  const { searchRef } = useBattle()
  const [isDragOver, setIsDragOver] = useState(false)
  const { addTrackToBracket, activeBracketId, setActiveBracketId } = useBattle()

  const canBattle = Boolean(bracket.left?.track && bracket.right?.track)

  return (
    <div
      className={cn(
        'flex h-20 w-72 items-center overflow-hidden rounded-xl border-2 border-zinc-500 border-dashed bg-zinc-700/20 text-sm shadow-lg transition',
        {
          'border-blue-500 bg-zinc-400/30': bracket.id === activeBracketId,
          'border border-white/10 border-solid bg-zinc-950': bracket.track,
          'border-green-500': isDragOver,
          'cursor-pointer justify-center': !bracket.track && interactive,
          className,
        },
      )}
      onClick={() => {
        if (bracket.track || !interactive) return
        setActiveBracketId(bracket.id)
        searchRef.current?.focus()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false)
        const track = JSON.parse(
          e.dataTransfer.getData('application/json'),
        ) as Track
        addTrackToBracket(bracket.id, track)
      }}
      {...props}
    >
      {bracket.track ? (
        <>
          {bracket.track?.image ? (
            <img
              src={bracket.track.image}
              alt=""
              className="pointer-events-none h-full select-none"
            />
          ) : (
            <div className="size-12">No image</div>
          )}
          <div className="flex h-full flex-col p-2">
            <span>{bracket.track.name}</span>
            <span className="text-white/50">{bracket.track.artist}</span>
          </div>
        </>
      ) : interactive ? (
        <div className="text-white/50">
          <span>Add track</span>
          <Icon icon="icon-park-outline:add-one" className="ml-1" inline />
        </div>
      ) : canBattle ? (
        'do it'
      ) : null}
    </div>
  )
}
