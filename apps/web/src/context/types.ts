import type { Dispatch } from 'react'

export type Track = {
  name: string
  artist: string
  image: string | undefined
}

export type Bracket = {
  id: string
  prev: [string, string] | null
  next: string | null
  track: Track | null
}

export type BattleContextValue = {
  brackets: Bracket[]
  setBrackets: Dispatch<React.SetStateAction<Bracket[]>>
  quarters: Bracket[]
  setQuarters: Dispatch<React.SetStateAction<Bracket[]>>
  semi: Bracket[]
  setSemi: Dispatch<React.SetStateAction<Bracket[]>>
  final: Bracket[]
  setFinal: Dispatch<React.SetStateAction<Bracket[]>>
  addTrackToBracket: (bracketId: string, track: Track) => void
  addTrackToFirstAvailableBracket: (track: Track) => void
  activeBracketId: string | null
  setActiveBracketId: Dispatch<React.SetStateAction<string | null>>
  searchRef: React.RefObject<HTMLInputElement | null>
  getBracketById: (bracketId: string | null | undefined) => Bracket | null
}
