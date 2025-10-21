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

export function SearchItem({ track, onPick, onRemove }: SearchItemsProps) {
  const { addTrackToFirstAvailableBracket } = useBattle()
  const imgRef = useRef<HTMLImageElement>(null)

  const handlePick = () => {
    addTrackToFirstAvailableBracket(track)
    onPick?.()
  }

  const removable = typeof onRemove === 'function'

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handlePick()
        }
      }}
      onClick={handlePick}
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
      className="focus-visible:emerald-ring flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left text-sm transition hover:bg-white/10 focus-visible:bg-white/10"
    >
      <SearchItemImage ref={imgRef} src={track.imagePreview} />
      <div className="flex grow flex-col justify-center">
        <span className="font-medium">{track.name}</span>
        <span className="text-white/50">{track.artist}</span>
      </div>
      {removable && (
        <button
          type="button"
          className={cn(
            'focus-visible:emerald-ring flex size-6 items-center justify-center overflow-hidden rounded-full font-medium text-sm text-white/50 ring-emerald-500 transition hover:text-white',
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

function SearchItemImage({
  src,
  className,
  ...props
}: React.ComponentProps<'img'>) {
  if (!src)
    return (
      <div className="flex aspect-square size-10 items-center justify-center">
        <Icon icon="ph:waveform-bold" width={16} height={16} />
      </div>
    )

  return (
    <img
      src={src}
      width={40}
      height={40}
      alt=""
      className={cn('pointer-events-none rounded-md object-cover', className)}
      {...props}
    />
  )
}
