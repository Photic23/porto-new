import { describe, it, expect } from 'vitest'
import { scrollProgress, easeInOutQuad, cameraPose, CAM } from './cameraPath'
import { fitToAspect, FIT_REF_ASPECT, FIT_MAX_PULL } from './cameraPath'

describe('scrollProgress', () => {
  it('clamps and normalizes', () => {
    expect(scrollProgress(0, 1000)).toBe(0)
    expect(scrollProgress(500, 1000)).toBe(0.5)
    expect(scrollProgress(2000, 1000)).toBe(1)
    expect(scrollProgress(-50, 1000)).toBe(0)
    expect(scrollProgress(0, 0)).toBe(1)
  })
})

describe('easeInOutQuad', () => {
  it('hits endpoints and midpoint', () => {
    expect(easeInOutQuad(0)).toBe(0)
    expect(easeInOutQuad(1)).toBe(1)
    expect(easeInOutQuad(0.5)).toBe(0.5)
  })
})

describe('cameraPose', () => {
  it('matches start, end and focus poses', () => {
    expect(cameraPose(0)).toEqual(CAM.start)
    expect(cameraPose(1)).toEqual(CAM.end)
    expect(cameraPose(1, 1)).toEqual(CAM.focus)
  })
  it('interpolates lookAt y between start and end', () => {
    const y = cameraPose(0.25).lookAt[1]
    expect(y).toBeLessThan(CAM.start.lookAt[1])
    expect(y).toBeGreaterThan(CAM.end.lookAt[1])
  })
  it('restored scroll is not the start pose', () => {
    expect(cameraPose(easeInOutQuad(scrollProgress(750, 1000)))).not.toEqual(CAM.start)
  })
  it('returns fresh arrays', () => {
    const p = cameraPose(0)
    p.position[0] = 99
    expect(CAM.start.position[0]).toBe(0)
  })
})

describe('fitToAspect', () => {
  const pos: [number, number, number] = [0, 7.5, 1.5]
  const look: [number, number, number] = [0, 0, -6]
  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

  it('leaves wide screens alone', () => {
    expect(fitToAspect(pos, look, FIT_REF_ASPECT, 1)).toEqual(pos)
    expect(fitToAspect(pos, look, 2.4, 1)).toEqual(pos)
  })
  it('pulls back along the view line by REF/aspect on narrow screens', () => {
    const out = fitToAspect(pos, look, FIT_REF_ASPECT / 1.5, 1)
    expect(dist(out, look)).toBeCloseTo(dist(pos, look) * 1.5, 5)
    // stays on the same line: direction unchanged
    const d0 = pos.map((v, i) => v - look[i]), d1 = out.map((v, i) => v - look[i])
    expect(d1[1] / d1[2]).toBeCloseTo(d0[1] / d0[2], 5)
  })
  it('caps the pull-back', () => {
    const out = fitToAspect(pos, look, 0.3, 1)
    expect(dist(out, look)).toBeCloseTo(dist(pos, look) * FIT_MAX_PULL, 5)
  })
  it('scales with weight (0 = no change)', () => {
    expect(fitToAspect(pos, look, 0.5, 0)).toEqual(pos)
    const half = fitToAspect(pos, look, FIT_REF_ASPECT / 2, 0.5)
    expect(dist(half, look)).toBeCloseTo(dist(pos, look) * 1.5, 5)
  })
})
