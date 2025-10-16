import { useCallback, useMemo, useRef, useState } from 'react'
import { BattleContext } from '~/context/BattleContext'
import type { Bracket, Track } from '~/context/types'

const defaultBrackets: Bracket[] = [
  { id: 'bracket-1', prev: null, next: 'quarter-1', track: null },
  { id: 'bracket-2', prev: null, next: 'quarter-1', track: null },
  { id: 'bracket-3', prev: null, next: 'quarter-2', track: null },
  { id: 'bracket-4', prev: null, next: 'quarter-2', track: null },
  { id: 'bracket-5', prev: null, next: 'quarter-3', track: null },
  { id: 'bracket-6', prev: null, next: 'quarter-3', track: null },
  { id: 'bracket-7', prev: null, next: 'quarter-4', track: null },
  { id: 'bracket-8', prev: null, next: 'quarter-4', track: null },
  { id: 'bracket-9', prev: null, next: 'quarter-5', track: null },
  { id: 'bracket-10', prev: null, next: 'quarter-5', track: null },
  { id: 'bracket-11', prev: null, next: 'quarter-6', track: null },
  { id: 'bracket-12', prev: null, next: 'quarter-6', track: null },
  { id: 'bracket-13', prev: null, next: 'quarter-7', track: null },
  { id: 'bracket-14', prev: null, next: 'quarter-7', track: null },
  { id: 'bracket-15', prev: null, next: 'quarter-8', track: null },
  { id: 'bracket-16', prev: null, next: 'quarter-8', track: null },
] as const

const defaultQuarters: Bracket[] = [
  {
    id: 'quarter-1',
    prev: ['bracket-1', 'bracket-2'],
    next: 'semi-1',
    track: null,
  },
  {
    id: 'quarter-2',
    prev: ['bracket-3', 'bracket-4'],
    next: 'semi-1',
    track: null,
  },
  {
    id: 'quarter-3',
    prev: ['bracket-5', 'bracket-6'],
    next: 'semi-2',
    track: null,
  },
  {
    id: 'quarter-4',
    prev: ['bracket-7', 'bracket-8'],
    next: 'semi-2',
    track: null,
  },
  {
    id: 'quarter-5',
    prev: ['bracket-9', 'bracket-10'],
    next: 'semi-3',
    track: null,
  },
  {
    id: 'quarter-6',
    prev: ['bracket-11', 'bracket-12'],
    next: 'semi-3',
    track: null,
  },
  {
    id: 'quarter-7',
    prev: ['bracket-13', 'bracket-14'],
    next: 'semi-4',
    track: null,
  },
  {
    id: 'quarter-8',
    prev: ['bracket-15', 'bracket-16'],
    next: 'semi-4',
    track: null,
  },
] as const

const defaultSemi: Bracket[] = [
  {
    id: 'semi-1',
    prev: ['quarter-1', 'quarter-2'],
    next: 'final-1',
    track: null,
  },
  {
    id: 'semi-2',
    prev: ['quarter-3', 'quarter-4'],
    next: 'final-1',
    track: null,
  },
  {
    id: 'semi-3',
    prev: ['quarter-5', 'quarter-6'],
    next: 'final-2',
    track: null,
  },
  {
    id: 'semi-4',
    prev: ['quarter-7', 'quarter-8'],
    next: 'final-2',
    track: null,
  },
] as const

const defaultFinal: Bracket[] = [
  {
    id: 'final-1',
    prev: ['semi-1', 'semi-2'],
    next: null,
    track: null,
  },
  {
    id: 'final-2',
    prev: ['semi-3', 'semi-4'],
    next: null,
    track: null,
  },
] as const

export const BattleProvider = ({ children }: { children: React.ReactNode }) => {
  const [brackets, setBrackets] = useState(defaultBrackets)
  const [quarters, setQuarters] = useState(defaultQuarters)
  const [semi, setSemi] = useState(defaultSemi)
  const [final, setFinal] = useState(defaultFinal)
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

  const getBracketById = useCallback(
    (id: string | null | undefined) => {
      if (!id) return null
      const bracket = [...brackets, ...quarters, ...semi, ...final].find(
        (bracket) => bracket.id === id,
      )
      return bracket ?? null
    },
    [brackets, final, quarters, semi],
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
      searchRef,
      getBracketById,
    }),
    [
      brackets,
      quarters,
      semi,
      final,
      activeBracketId,
      addTrackToFirstAvailableBracket,
      getBracketById,
    ],
  )

  return <BattleContext value={value}>{children}</BattleContext>
}
