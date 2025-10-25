import { useRef } from 'react'
import { NoImage, Thumbnail } from '~/components/Thumbnail'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'
import { Icon } from '~/icons/misc/Icon'
import { X } from '~/icons/X'
import { cn } from '~/utils/cn'

type SearchItemsProps = {
  track: Track
  onPick: () => void
  onRemove?: () => void
}

export function SearchItem({ track, onPick, onRemove }: SearchItemsProps) {
  const { addTrackToFirstAvailableBracket } = useBattle()
  const imgRef = useRef<HTMLImageElement>(null)

  const handlePick = () => {
    addTrackToFirstAvailableBracket(track)
    onPick?.()
  }

  const removable = typeof onRemove === 'function'

  return (
    <button
      type="button"
      draggable
      onClick={handlePick}
      onDragStart={(event) => {
        event.dataTransfer.setData('application/json', JSON.stringify(track))
        if (imgRef.current) {
          event.dataTransfer.setDragImage(
            imgRef.current,
            imgRef.current.clientWidth / 2,
            imgRef.current.clientHeight / 2,
          )
        }
      }}
      className="focus-visible:emerald-ring flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left text-sm transition hover:bg-white/10 focus-visible:bg-white/10"
    >
      <Thumbnail
        ref={imgRef}
        src={track.imagePreview}
        alt={track.name}
        size={40}
        className="rounded-md"
      >
        <NoImage className="size-10" />
      </Thumbnail>
      <div className="flex grow flex-col justify-center">
        <span className="font-medium">{track.name}</span>
        <span className="text-white/50">{track.artist}</span>
      </div>
      {removable && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Remove from recent"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              onRemove()
            }
          }}
          className={cn(
            'focus-visible:emerald-ring flex size-6 items-center justify-center overflow-hidden rounded-full font-medium text-sm text-white/50 ring-emerald-500 transition hover:text-white',
          )}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <Icon icon={X} size={16} aria-hidden />
        </div>
      )}
    </button>
  )
}
