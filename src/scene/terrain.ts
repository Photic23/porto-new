const hAt = (x: number, z: number): number =>
  Math.sin(x * 0.08) * 2.2 +
  Math.cos(z * 0.06) * 2.6 +
  Math.sin((x + z) * 0.15) * 0.6 +
  Math.max(0, (-z - 30) * 0.25)

export function groundHeight(x: number, z: number): number {
  return hAt(x, z) * (Math.hypot(x, z + 6) < 10 ? 0.15 : 1)
}

export const NOTEBOOK_POS: [number, number, number] = [0, groundHeight(0, -6) + 0.05, -6]
