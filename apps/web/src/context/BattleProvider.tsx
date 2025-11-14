import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { storeSong } from '~/api/backend'
import { useSpotifyAuth } from '~/auth/SpotifyAuthContext'
import { BattleContext } from '~/context/BattleContext'
import { createBrackets, createEdges, getBracketsOnDepth, TREE_DEPTH, updateBracketById } from '~/context/brackets'
import type { Edge, Track } from '~/context/types'

export function BattleProvider({ children }: React.PropsWithChildren) {
  const [tree, setTree] = useState(createBrackets())
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { tokens } = useSpotifyAuth()
  const queryClient = useQueryClient()
  const [edges, setEdges] = useState<Record<string, Edge> | null>(null)
  const bracketsRef = useRef<Record<string, HTMLDivElement>>({})

  const initiateEdges = useEffectEvent(() => setEdges(createEdges(tree, bracketsRef.current)))

  useLayoutEffect(() => initiateEdges(), [])

  const storeSongMutation = useMutation({
    mutationFn: async (track: Track) => {
      if (tokens?.accessToken) return storeSong(track, tokens.accessToken)
    },
    onMutate: async function optimisticUpdate(track: Track) {
      await queryClient.cancelQueries({ queryKey: ['recents'] })
      const prevRecents = queryClient.getQueryData(['recents'])
      queryClient.setQueryData(['recents'], (old: Track[]) => {
        const index = old.findIndex((t) => t.id === track.id)
        if (index !== -1) return [track, ...old.toSpliced(index, 1)]
        return [track, ...old].slice(0, 5)
      })
      return { prevRecents }
    },
    onError: (error, _variables, context) => {
      console.error(error)
      if (context?.prevRecents) queryClient.setQueryData(['recents'], context.prevRecents)
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: ['recents'] }),
  })

  const addTrackToBracket = (bracketId: string, track: Track) => {
    setTree((prev) => updateBracketById(prev, bracketId, { track }))
    setActiveBracketId(null)
    void storeSongMutation.mutate(track)
  }

  const addTrackToFirstAvailableBracket = (track: Track) => {
    if (activeBracketId) {
      addTrackToBracket(activeBracketId, track)
      return
    }

    const brackets = getBracketsOnDepth(tree, TREE_DEPTH)

    for (const bracket of brackets) {
      if (bracket.track === null) {
        addTrackToBracket(bracket.id, track)
        return
      }
    }

    console.error('No available brackets')
  }

  const value = {
    tree,
    addTrackToBracket,
    addTrackToFirstAvailableBracket,
    activeBracketId,
    setActiveBracketId,
    searchRef,
    bracketsRef,
    edges,
  }

  return <BattleContext value={value}>{children}</BattleContext>
}
