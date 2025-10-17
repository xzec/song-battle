import { Icon } from '@iconify-icon/react'
import { useRef } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'
import { cn } from '~/utils/cn'

type SearchItemsProps = {
  track: Track
  onPick: () => void
  onRemove?: () => void
}

export const SearchItem = ({ track, onPick, onRemove }: SearchItemsProps) => {
  const { addTrackToFirstAvailableBracket } = useBattle()
  const imgRef = useRef<HTMLImageElement>(null)

  const removable = typeof onRemove === 'function'

  return (
    <div
      draggable
      onClick={() => {
        addTrackToFirstAvailableBracket(track)
        onPick?.()
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(track))
        if (imgRef.current) {
          e.dataTransfer.setDragImage(
            imgRef.current,
            imgRef.current.clientWidth / 2,
            imgRef.current.clientHeight / 2,
          )
        }
      }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left text-sm transition hover:bg-white/10 hover:text-white"
    >
      <img
        ref={imgRef}
        src={track.imagePreview}
        width={40}
        height={40}
        className="rounded-md"
        alt=""
        draggable={false}
      />
      <div className="flex grow flex-col justify-center">
        <span className="font-medium">{track.name}</span>
        <span className="text-white/50">{track.artist}</span>
      </div>
      {removable && (
        <button
          type="button"
          className={cn(
            'flex size-6 items-center justify-center overflow-hidden rounded-full font-medium text-sm text-white/80 ring-emerald-500 transition hover:text-white focus-visible:ring-0',
          )}
          aria-label="Remove from history"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <Icon icon="ic:baseline-clear" inline />
        </button>
      )}
    </div>
  )
}
