export type Vec3 = [number, number, number]

export const CAM = {
  start: { position: [0, 6, 14] as Vec3, lookAt: [0, 30, -40] as Vec3 },
  end: { position: [0, 7.5, 1.5] as Vec3, lookAt: [0, 0, -6] as Vec3 },
  focus: { position: [0, 4.2, -3.2] as Vec3, lookAt: [0, 0, -6] as Vec3 },
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function scrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) return 1
  return clamp01(scrollY / maxScroll)
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

export function cameraPose(p: number, focus = 0): { position: Vec3; lookAt: Vec3 } {
  const t = clamp01(p)
  const f = clamp01(focus)
  const position = lerp3(lerp3(CAM.start.position, CAM.end.position, t), CAM.focus.position, f)
  const lookAt = lerp3(lerp3(CAM.start.lookAt, CAM.end.lookAt, t), CAM.focus.lookAt, f)
  return { position, lookAt }
}
