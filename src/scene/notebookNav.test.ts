import { describe, it, expect } from 'vitest'
import { NAV_POLAROIDS } from './notebookNav'
import { SECTIONS } from '@/content/sections'

describe('NAV_POLAROIDS', () => {
  it('has one polaroid per section, in menu order', () => {
    expect(NAV_POLAROIDS.map((p) => p.id)).toEqual([...SECTIONS])
  })
  it('puts bio and education on the left page, experience and competition on the right', () => {
    const x = Object.fromEntries(NAV_POLAROIDS.map((p) => [p.id, p.pos[0]]))
    expect(x.bio).toBeLessThan(0)
    expect(x.education).toBeLessThan(0)
    expect(x.experience).toBeGreaterThan(0)
    expect(x.competition).toBeGreaterThan(0)
  })
  it('keeps every polaroid inside its page (pages are 2.85 x 3.85, spine at x=0)', () => {
    for (const p of NAV_POLAROIDS) {
      expect(Math.abs(p.pos[0])).toBeGreaterThan(0.6)
      expect(Math.abs(p.pos[0])).toBeLessThan(2.85 - 0.6)
      expect(Math.abs(p.pos[2])).toBeLessThan(3.85 / 2 - 0.7)
    }
  })
  it('gives each photo its own colour', () => {
    expect(new Set(NAV_POLAROIDS.map((p) => p.color)).size).toBe(4)
  })
})
