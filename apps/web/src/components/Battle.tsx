import { Bracket } from '~/components/Bracket'
import { Search } from '~/components/Search'
import { useBattle } from '~/context/BattleContext'
import { getBracketsOnDepth } from '~/context/brackets'
import { getLinkPath } from '~/utils/get-link-path'
import { toArrayPairs } from '~/utils/to-array-pairs'

export const Battle = () => {
  const { tree, edges } = useBattle()

  const contestants = getBracketsOnDepth(tree, 4)
  const quarters = getBracketsOnDepth(tree, 3)
  const semis = getBracketsOnDepth(tree, 2)
  const finals = getBracketsOnDepth(tree, 1)

  return (
    <>
      <div className="pointer-events-none fixed z-100 flex w-full justify-center bg-linear-to-b from-zinc-900/60 to-transparent p-2">
        <header className="flex w-full max-w-xl items-center">
          <Search />
        </header>
      </div>
      <main className="relative flex w-fit gap-4 py-20">
        <div className="flex flex-col gap-2 p-2 *:last:mb-0! *:even:mb-8">
          {contestants.map((bracket) => (
            <Bracket key={bracket.id} interactive bracket={bracket} />
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(quarters).map(([left, right], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket bracket={left} />
              <Bracket bracket={right} />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(semis).map(([left, right], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket bracket={left} />
              <Bracket bracket={right} />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-evenly p-2">
          {toArrayPairs(finals).map(([left, right], index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-center gap-2"
            >
              <Bracket bracket={left} />
              <Bracket bracket={right} />
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center p-2">
          <Bracket bracket={tree} />
        </div>
        {edges.map((edge, i) => (
          <svg
            key={i}
            className="pointer-events-none absolute top-0 left-0 z-100 size-full fill-none stroke-2 stroke-zinc-700"
          >
            <path d={getLinkPath(...edge)} />
          </svg>
        ))}
      </main>
    </>
  )
}
