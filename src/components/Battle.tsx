import { useRef } from 'react'
import { Bracket } from '~/components/Bracket'
import { Search } from '~/components/Search'
import { useBattle } from '~/context/BattleContext'

export const Battle = () => {
  const { brackets } = useBattle()
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="flex w-full justify-center p-2">
        <header className="flex w-full max-w-4xl items-center">
          <Search ref={searchRef} />
        </header>
      </div>
      <main className="relative">
        <div className="flex w-full flex-col gap-4 p-2">
          {brackets.map((bracket) => (
            <Bracket
              key={bracket.id}
              bracketId={bracket.id}
              track={bracket.track}
              searchRef={searchRef}
            />
          ))}
        </div>
      </main>
    </>
  )
}
