import { Bracket } from '~/components/Bracket'
import { Search } from '~/components/Search'
import { useBattle } from '~/context/BattleContext'
import { toArrayPairs } from '~/utils/toArrayPairs'

export const Battle = () => {
  const { brackets, quarters, semi, final, getBracketById } = useBattle()

  return (
    <>
      <div className="pointer-events-none fixed z-100 flex w-full justify-center bg-linear-to-b from-zinc-900/60 to-transparent p-2">
        <header className="flex w-full max-w-xl items-center">
          <Search />
        </header>
      </div>
      <main className="relative flex gap-4 py-20">
        <div className="flex flex-col gap-2 p-2 *:last:mb-0! *:even:mb-8">
          {brackets.map((bracket) => (
            <Bracket
              key={bracket.id}
              interactive
              bracketId={bracket.id}
              track={bracket.track}
            />
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(quarters).map(([bracketA, bracketB], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket
                bracketId={bracketA.id}
                track={bracketA.track}
                prevA={getBracketById(bracketA.prev![0])}
                prevB={getBracketById(bracketA.prev![1])}
              />
              <Bracket
                bracketId={bracketB.id}
                track={bracketB.track}
                prevA={getBracketById(bracketB.prev![0])}
                prevB={getBracketById(bracketB.prev![1])}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(semi).map(([bracketA, bracketB], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket
                bracketId={bracketA.id}
                track={bracketA.track}
                prevA={getBracketById(bracketA.prev![0])}
                prevB={getBracketById(bracketA.prev![1])}
              />
              <Bracket
                bracketId={bracketB.id}
                track={bracketB.track}
                prevA={getBracketById(bracketB.prev![0])}
                prevB={getBracketById(bracketB.prev![1])}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(final).map(([bracketA, bracketB], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket
                bracketId={bracketA.id}
                track={bracketA.track}
                prevA={getBracketById(bracketA.prev![0])}
                prevB={getBracketById(bracketA.prev![1])}
              />
              <Bracket
                bracketId={bracketB.id}
                track={bracketB.track}
                prevA={getBracketById(bracketB.prev![0])}
                prevB={getBracketById(bracketB.prev![1])}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
