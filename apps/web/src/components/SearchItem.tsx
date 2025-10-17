import { useRef } from 'react'
import { useBattle } from '~/context/BattleContext'
import type { Track } from '~/context/types'

type SearchItemsProps = {
  imagePreview: string | undefined
  track: Track
  onPick: () => void
}

export const SearchItem = ({
  imagePreview,
  track,
  onPick,
}: SearchItemsProps) => {
  const { addTrackToFirstAvailableBracket } = useBattle()
  const imgRef = useRef<HTMLImageElement>(null)

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
        src={imagePreview}
        width={40}
        height={40}
        className="rounded-md"
        alt=""
        draggable={false}
      />
      <div className="flex flex-col justify-center">
        <span className="font-medium">{track.name}</span>
        <span className="text-white/50">{track.artist}</span>
      </div>
    </div>
  )
}
