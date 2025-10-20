import { Icon } from '@iconify-icon/react'
import { type RefCallback, useCallback, useState } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { BracketNode, Track } from '~/context/types'
import { cn } from '~/utils/cn'

interface BracketProps extends React.HTMLAttributes<HTMLDivElement> {
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

  const canBattle = Boolean(bracket.left?.track && bracket.right?.track)
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
        'relative flex h-20 items-center overflow-hidden rounded-xl border border-violet-300 text-sm transition',
        {
          'cursor-pointer justify-center border-dashed bg-zinc-700/30':
            !bracket.track && interactive,
          'border-blue-500 border-solid bg-blue-500/10': isActive,
          'border-green-500 border-solid bg-green-500/20': isDragOver,
          'border-none bg-zinc-950 shadow-sm': bracket.track,
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
        e.dataTransfer.dropEffect = interactive ? 'copy' : 'none'
        if (interactive) setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false)
        if (!interactive) return
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
              className="pointer-events-none aspect-square h-full select-none object-cover"
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
        <>
          {isDragOver ? (
            <span className="text-green-500">Release to add</span>
          ) : isActive ? (
            <span className="text-blue-500">Choose from search</span>
          ) : (
            <div className="text-white">
              <span>Add track</span>
              <Icon icon="icon-park-outline:add-one" className="ml-1" inline />
            </div>
          )}
        </>
      ) : canBattle ? (
        'do it'
      ) : null}
    </div>
  )
}
