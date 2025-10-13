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

const defaultQuarters: Bracket[] = [
  { id: 'quarter-1', track: null },
  { id: 'quarter-2', track: null },
  { id: 'quarter-3', track: null },
  { id: 'quarter-4', track: null },
  { id: 'quarter-5', track: null },
  { id: 'quarter-6', track: null },
  { id: 'quarter-7', track: null },
  { id: 'quarter-8', track: null },
] as const

const defaultSemi: Bracket[] = [
  { id: 'quarter-1', track: null },
  { id: 'quarter-2', track: null },
  { id: 'quarter-3', track: null },
  { id: 'quarter-4', track: null },
] as const

const defaultFinal: Bracket[] = [
  { id: 'final-1', track: null },
  { id: 'final-2', track: null },
] as const

export const BattleProvider = ({ children }: { children: React.ReactNode }) => {
  const [brackets, setBrackets] = useState(defaultBrackets)
  const [quarters, setQuarters] = useState(defaultQuarters)
  const [semi, setSemi] = useState(defaultSemi)
  const [final, setFinal] = useState(defaultFinal)
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
      quarters,
      setQuarters,
      semi,
      setSemi,
      final,
      setFinal,
      addTrackToBracket,
      addTrackToFirstAvailableBracket,
      activeBracketId,
      setActiveBracketId,
    }),
    [
      brackets,
      quarters,
      semi,
      final,
      activeBracketId,
      addTrackToFirstAvailableBracket,
    ],
  )

  return <BattleContext value={value}>{children}</BattleContext>
}
