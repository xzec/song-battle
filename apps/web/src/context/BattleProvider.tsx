import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { storeSong } from '~/api/backend'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { BattleContext } from '~/context/BattleContext'
import {
  createBrackets,
  createEdges,
  getBracketsOnDepth,
  TREE_DEPTH,
  updateBracketById,
} from '~/context/brackets'
import type { Edge, Track } from '~/context/types'

export const BattleProvider = ({ children }: { children: React.ReactNode }) => {
  const [tree, setTree] = useState(createBrackets())
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { tokens } = useSpotifyAuth()
  const queryClient = useQueryClient()
  const [bracketRect, setBracketRect] = useState(new Map<string, DOMRect>())
  const edges = useMemo<Edge[]>(() => {
    if (!bracketRect) return []
    return createEdges(tree, bracketRect)
  }, [bracketRect, tree])

  const storeSongMutation = useMutation({
    mutationFn: async (track: Track) => {
      if (tokens?.accessToken) await storeSong(track, tokens?.accessToken)
    },
    onMutate: async function optimisticUpdate(track: Track) {
      await queryClient.cancelQueries({ queryKey: ['history'] })
      const previousHistory = queryClient.getQueryData(['history'])
      queryClient.setQueryData(['history'], (old: Track[]) => {
        const existingTrack = old.find((t) => t.id === track.id)
        if (existingTrack !== undefined) {
          old.splice(old.indexOf(existingTrack), 1)
          old.unshift(existingTrack)
          return old
        }
        if (old.length === 5) old.pop()
        return [track, ...old]
      })
      return { previousHistory }
    },
    onError: (error, _newHistory, context) => {
      console.error(error)
      if (context?.previousHistory)
        queryClient.setQueryData(['history'], context.previousHistory)
    },
  })

  const addTrackToBracket = useCallback(
    (bracketId: string, track: Track) => {
      setTree((prev) => updateBracketById(prev, bracketId, { track }))
      setActiveBracketId(null)
      void storeSongMutation.mutate(track)
    },
    [storeSongMutation],
  )

  const addTrackToFirstAvailableBracket = useCallback(
    (track: Track) => {
      if (activeBracketId) {
        addTrackToBracket(activeBracketId, track)
        return
      }

      const brackets = getBracketsOnDepth(tree, TREE_DEPTH)
      if (!brackets.some((bracket) => bracket.track === null)) {
        console.error('No available brackets')
        return
      }

      for (const bracket of brackets) {
        if (bracket.track === null) {
          addTrackToBracket(bracket.id, track)
          break
        }
      }
    },
    [activeBracketId, addTrackToBracket, tree],
  )

  const registerBracketRect = useCallback(
    (bracketId: string, rect: DOMRect) => {
      setBracketRect((prev) => {
        const map = new Map(prev)
        map.set(bracketId, rect)
        return map
      })
    },
    [],
  )

  const value = useMemo(
    () => ({
      tree,
      addTrackToBracket,
      addTrackToFirstAvailableBracket,
      activeBracketId,
      setActiveBracketId,
      searchRef,
      bracketRect,
      registerBracketRect,
      edges,
    }),
    [
      tree,
      addTrackToBracket,
      addTrackToFirstAvailableBracket,
      activeBracketId,
      bracketRect,
      registerBracketRect,
      edges,
    ],
  )

  return <BattleContext value={value}>{children}</BattleContext>
}
