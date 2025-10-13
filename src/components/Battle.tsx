import { useRef } from 'react'
import { Bracket } from '~/components/Bracket'
import { Search } from '~/components/Search'
import { useBattle } from '~/context/BattleContext'
import type { Bracket as BracketType } from '~/context/types'

export const Battle = () => {
  const { brackets, quarters } = useBattle()
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="pointer-events-none fixed z-100 flex w-full justify-center p-2">
        <header className="flex w-full max-w-xl items-center">
          <Search ref={searchRef} />
        </header>
      </div>
      <main className="relative flex">
        <div className="flex flex-col p-2 pt-20 *:even:mb-8">
          {brackets.map((bracket) => (
            <Bracket
              key={bracket.id}
              bracketId={bracket.id}
              track={bracket.track}
              searchRef={searchRef}
            />
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2 pt-20">
          {quarters
            .reduce<BracketType[][]>((acc, curr, index) => {
              const i = Math.floor(index / 2)
              if (Array.isArray(acc[i])) acc[i].push(curr)
              else acc[i] = [curr]
              return acc
            }, [])
            .map(([bracketA, bracketB], index) => (
              <div key={index} className="flex flex-col">
                <Bracket
                  bracketId={bracketA.id}
                  track={bracketA.track}
                  searchRef={searchRef}
                />
                <Bracket
                  bracketId={bracketB.id}
                  track={bracketB.track}
                  searchRef={searchRef}
                />
              </div>
            ))}
        </div>
      </main>
    </>
  )
}
