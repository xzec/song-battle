import { Bracket } from '~/components/Bracket'
import * as Column from '~/components/Column'
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
      <div className="pointer-events-none fixed z-100 flex w-full justify-center bg-linear-to-b from-zinc-900/50 to-transparent p-2">
        <header className="group flex w-full max-w-xl items-center">
          <Search />
        </header>
      </div>
      <main className="relative grid w-full grid-cols-5 gap-6 p-3 pt-20">
        <Column.Root>
          <Column.Title>Contestants</Column.Title>
          <Column.Content className="*:last:mb-0! *:even:mb-8">
            {contestants.map((bracket) => (
              <Bracket key={bracket.id} interactive bracket={bracket} />
            ))}
          </Column.Content>
        </Column.Root>
        <Column.Root>
          <Column.Title>Quarter</Column.Title>
          <Column.Content className="h-full justify-evenly">
            {toArrayPairs(quarters).map(([left, right], index) => (
              <div key={index} className="flex flex-col justify-center gap-2">
                <Bracket bracket={left} />
                <Bracket bracket={right} />
              </div>
            ))}
          </Column.Content>
        </Column.Root>
        <Column.Root>
          <Column.Title>Semi</Column.Title>
          <Column.Content className="h-full justify-evenly">
            {toArrayPairs(semis).map(([left, right], index) => (
              <div key={index} className="flex flex-col justify-center gap-2">
                <Bracket bracket={left} />
                <Bracket bracket={right} />
              </div>
            ))}
          </Column.Content>
        </Column.Root>
        <Column.Root>
          <Column.Title>Final</Column.Title>
          <Column.Content className="h-full justify-evenly">
            {toArrayPairs(finals).map(([left, right], index) => (
              <div key={index} className="flex flex-col justify-center gap-2">
                <Bracket bracket={left} />
                <Bracket bracket={right} />
              </div>
            ))}
          </Column.Content>
        </Column.Root>
        <Column.Root>
          <Column.Title>Winner</Column.Title>
          <Column.Content className="h-full justify-center">
            <Bracket bracket={tree} />
          </Column.Content>
        </Column.Root>
        <svg className="pointer-events-none absolute top-0 left-0 size-full fill-none stroke-1 stroke-violet-300">
          {edges.map((edge, i) => (
            <path key={i} d={getLinkPath(...edge)} />
          ))}
        </svg>
      </main>
    </>
  )
}
