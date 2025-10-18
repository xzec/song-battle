export function getLinkPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2 // where the bend should be

  // direction
  const xDir = Math.sign(x2 - x1)
  const yDir = Math.sign(y2 - y1)

  // calculate the bend radius, clamp if needed
  const maxRadius = 10
  const xDistance = Math.abs(x2 - x1)
  const yDistance = Math.abs(y2 - y1)
  const radius = Math.min(
    maxRadius,
    Math.floor(Math.min(xDistance, yDistance) / 2),
  ) // clamp

  // flow: start at x1,y1; draw a horizontal line; make a Bézier curve; draw a vertical line; make a Bézier curve; draw line to x2,y2
  return `
  M${x1} ${y1}
  L${midX - radius * xDir} ${y1}
  Q${midX} ${y1}
   ${midX} ${y1 - radius * -yDir}
  L${midX} ${y2 + radius * -yDir}
  Q${midX} ${y2}
   ${midX + radius * xDir} ${y2}
  L${x2} ${y2}
`
    .replace(/\s+/g, ' ')
    .trim()
}
