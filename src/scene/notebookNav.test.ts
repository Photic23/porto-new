import { describe, it, expect } from 'vitest'
import { NAV_POLAROIDS, POLAROID_SIZE } from './notebookNav'
import { SECTIONS } from '@/content/sections'

describe('NAV_POLAROIDS', () => {
  it('has one polaroid per section, in menu order', () => {
    expect(NAV_POLAROIDS.map((p) => p.id)).toEqual([...SECTIONS])
  })
  it('puts the first three sections on the left page and the last three on the right', () => {
    const x = Object.fromEntries(NAV_POLAROIDS.map((p) => [p.id, p.pos[0]]))
    for (const id of ['bio', 'education', 'experience']) expect(x[id]).toBeLessThan(0)
    for (const id of ['organization', 'projects', 'achievement']) expect(x[id]).toBeGreaterThan(0)
  })
  it('stacks three rows per page without polaroids overlapping', () => {
    for (const side of [-1, 1]) {
      const page = NAV_POLAROIDS.filter((p) => Math.sign(p.pos[0]) === side)
      expect(page).toHaveLength(3)
      for (let i = 0; i < page.length; i++)
        for (let j = i + 1; j < page.length; j++) {
          const [a, b] = [page[i].pos, page[j].pos]
          const apartX = Math.abs(a[0] - b[0]) >= POLAROID_SIZE[0]
          const apartZ = Math.abs(a[2] - b[2]) >= POLAROID_SIZE[1]
          expect(apartX || apartZ).toBe(true)
        }
    }
  })
  it('keeps every polaroid inside its page (pages are 2.85 x 3.85, spine at x=0)', () => {
    for (const p of NAV_POLAROIDS) {
      expect(Math.abs(p.pos[0])).toBeGreaterThan(0.6)
      expect(Math.abs(p.pos[0])).toBeLessThan(2.85 - 0.6)
      expect(Math.abs(p.pos[2]) + POLAROID_SIZE[1] / 2).toBeLessThan(3.85 / 2)
    }
  })
  it('gives each photo its own colour', () => {
    expect(new Set(NAV_POLAROIDS.map((p) => p.color)).size).toBe(6)
  })
})
