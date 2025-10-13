import type { Dispatch } from 'react'

export type Track = {
  name: string
  artist: string
  image: string | undefined
}

export type Bracket = {
  id: string
  track: Track | null
}

export type BattleContextValue = {
  brackets: Bracket[]
  setBrackets: Dispatch<React.SetStateAction<Bracket[]>>
  addTrackToBracket: (bracketId: string, track: Track) => void
  addTrackToFirstAvailableBracket: (track: Track) => void
  activeBracketId: string | null
  setActiveBracketId: Dispatch<React.SetStateAction<string | null>>
}
