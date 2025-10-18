import type { BracketNode } from '~/context/types'

export const LAYERS = [
  'winner',
  'final',
  'semi',
  'quarter',
  'contestant',
] as const
export const TREE_DEPTH = 4
type Layer = (typeof LAYERS)[number]

export function createBrackets() {
  const layerIndex: Record<Layer, number> = {
    winner: 0,
    final: 0,
    semi: 0,
    quarter: 0,
    contestant: 0,
  }

  const createNode = (
    id: string,
    index?: number,
    parent?: BracketNode,
  ): BracketNode => ({
    id: typeof index === 'number' ? `${id}-${index}` : id,
    track: null,
    left: null,
    right: null,
    parent: typeof parent === 'undefined' ? null : parent,
  })

  const createLayer = (node: BracketNode, depth: number) => {
    if (depth > TREE_DEPTH) return

    const layer = LAYERS[depth]
    node.left = createNode(layer, ++layerIndex[layer], node)
    node.right = createNode(layer, ++layerIndex[layer], node)

    createLayer(node.left, depth + 1)
    createLayer(node.right, depth + 1)
  }

  const root = createNode(LAYERS[0])
  createLayer(root, 1)

  return root
}

export function getBracketsOnDepth(
  node: BracketNode | null,
  depth: number,
  result: BracketNode[] = [],
) {
  if (!node) return result
  if (depth === 0) {
    result.push(node)
    return result
  }

  getBracketsOnDepth(node.left, depth - 1, result)
  getBracketsOnDepth(node.right, depth - 1, result)

  return result
}

export function getBracketById(
  node: BracketNode | null,
  id: string,
): BracketNode | undefined {
  if (!node) return
  if (node.id === id) return node

  return getBracketById(node.left, id) || getBracketById(node.right, id)
}

export function updateBracketById(
  node: BracketNode,
  bracketId: string,
  patch: Partial<Omit<BracketNode, 'id'>>,
): BracketNode {
  if (node.id === bracketId) {
    return { ...node, ...patch }
  }

  return {
    ...node,
    left: node.left ? updateBracketById(node.left, bracketId, patch) : null,
    right: node.right ? updateBracketById(node.right, bracketId, patch) : null,
  }
}
