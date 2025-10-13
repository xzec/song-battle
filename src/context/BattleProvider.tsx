import { useCallback, useMemo, useState } from 'react'
import { BattleContext } from '~/context/BattleContext'
import type { Bracket, Track } from '~/context/types'

const defaultBrackets: Bracket[] = [
  { id: 'bracket-1', track: null },
  { id: 'bracket-2', track: null },
  { id: 'bracket-3', track: null },
  { id: 'bracket-4', track: null },
  { id: 'bracket-5', track: null },
  { id: 'bracket-6', track: null },
  { id: 'bracket-7', track: null },
  { id: 'bracket-8', track: null },
  { id: 'bracket-9', track: null },
  { id: 'bracket-10', track: null },
  { id: 'bracket-11', track: null },
  { id: 'bracket-12', track: null },
  { id: 'bracket-13', track: null },
  { id: 'bracket-14', track: null },
  { id: 'bracket-15', track: null },
  { id: 'bracket-16', track: null },
] as const

export const BattleProvider = ({ children }: { children: React.ReactNode }) => {
  const [brackets, setBrackets] = useState(defaultBrackets)
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null)

  const addTrackToBracket = (bracketId: string, track: Track) => {
    setBrackets((prev) => {
      return prev.map((bracket) => {
        if (bracket.id === bracketId) return { ...bracket, track }
        return bracket
      })
    })
  }

  const addTrackToFirstAvailableBracket = useCallback(
    (track: Track) => {
      if (activeBracketId) {
        addTrackToBracket(activeBracketId, track)
        return
      }

      for (const bracket of brackets) {
        if (bracket.track === null) {
          addTrackToBracket(bracket.id, track)
          break
        }
      }
    },
    [activeBracketId, brackets],
  )

  const value = useMemo(
    () => ({
      brackets,
      setBrackets,
      addTrackToBracket,
      addTrackToFirstAvailableBracket,
      activeBracketId,
      setActiveBracketId,
    }),
    [brackets, activeBracketId, addTrackToFirstAvailableBracket],
  )

  return <BattleContext value={value}>{children}</BattleContext>
}
