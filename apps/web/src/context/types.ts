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
  bracketRect: Map<string, DOMRect>
  registerBracketRect: (bracketId: string, rect: DOMRect) => void
  edges: Edge[]
}

export type Edge = [x1: number, y1: number, x2: number, y2: number]
