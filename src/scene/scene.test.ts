import { describe, it, expect } from 'vitest'
import { mulberry32 } from './rng'
import { tierFor, pixelSizeFor, sceneConfig } from './sceneConfig'
import { groundHeight, NOTEBOOK_POS } from './terrain'

describe('mulberry32', () => {
  it('is deterministic and in [0,1)', () => {
    const a = mulberry32(1)
    const b = mulberry32(1)
    const va = Array.from({ length: 5 }, () => a())
    const vb = Array.from({ length: 5 }, () => b())
    expect(va).toEqual(vb)
    for (const v of va) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('sceneConfig', () => {
  it('picks tier by width', () => {
    expect(tierFor(767)).toBe('mobile')
    expect(tierFor(768)).toBe('desktop')
    expect(pixelSizeFor('desktop')).toBe(5)
    expect(pixelSizeFor('mobile')).toBe(3)
  })
  it('mobile is lighter than desktop', () => {
    expect(sceneConfig('mobile').trees).toBeLessThan(sceneConfig('desktop').trees)
    expect(sceneConfig('mobile').flowers).toBeLessThan(sceneConfig('desktop').flowers)
  })
})

describe('terrain', () => {
  it('flattens the notebook clearing', () => {
    expect(Math.abs(groundHeight(0, -6))).toBeLessThan(1)
    expect(groundHeight(0, -6)).toBe(NOTEBOOK_POS[1] - 0.05)
  })
})
