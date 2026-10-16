import { describe, it, expect } from 'vitest'
import { scrollProgress, easeInOutQuad, cameraPose, CAM } from './cameraPath'

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
