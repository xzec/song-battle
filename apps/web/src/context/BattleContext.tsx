import { createContext, useContext } from 'react'
import type { BattleContextValue } from '~/context/types'

export const BattleContext = createContext<BattleContextValue | null>(null)

export const useBattle = () => {
  const context = useContext(BattleContext)
  if (!context) throw new Error('useBattle must be used within BattleProvider')
  return context
}
