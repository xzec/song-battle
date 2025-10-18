import type { Dispatch } from 'react'

export type Track = {
  id: string
  name: string
  artist: string
  image: string | undefined
  imagePreview: string | undefined
}

export type BracketNode = {
  id: string
  track: Track | null
  parent: BracketNode | null
  left: BracketNode | null
  right: BracketNode | null
}

export type BattleContextValue = {
  tree: BracketNode
  setTree: Dispatch<React.SetStateAction<BracketNode>>
  addTrackToBracket: (bracketId: string, track: Track) => void
  addTrackToFirstAvailableBracket: (track: Track) => void
  activeBracketId: string | null
  setActiveBracketId: Dispatch<React.SetStateAction<string | null>>
  searchRef: React.RefObject<HTMLInputElement | null>
}
