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
  addTrackToBracket: (bracketId: string, track: Track) => void
  addTrackToFirstAvailableBracket: (track: Track) => void
  activeBracketId: string | null
  setActiveBracketId: React.Dispatch<React.SetStateAction<string | null>>
  searchRef: React.RefObject<HTMLInputElement | null>
  bracketsRef: React.RefObject<Record<string, HTMLDivElement>>
  edges: Record<string, Edge> | null
}

export type Edge = { x: number; y: number }
