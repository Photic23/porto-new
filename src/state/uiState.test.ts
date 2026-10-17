import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { uiReducer, initialUI, useScrollLock } from '@/state/uiState'

describe('uiReducer', () => {
  it('move +1 from bio goes to education', () => {
    expect(uiReducer(initialUI, { type: 'move', dir: 1 }).selected).toBe('education')
  })
  it('move -1 from bio wraps to achievement', () => {
    expect(uiReducer(initialUI, { type: 'move', dir: -1 }).selected).toBe('achievement')
  })
  it('open without id opens selected', () => {
    const s = uiReducer({ selected: 'experience', open: null }, { type: 'open' })
    expect(s).toEqual({ selected: 'experience', open: 'experience' })
  })
  it('open with id sets both', () => {
    const s = uiReducer(initialUI, { type: 'open', id: 'achievement' })
    expect(s).toEqual({ selected: 'achievement', open: 'achievement' })
  })
  it('close nulls open, keeps selected', () => {
    const s = uiReducer({ selected: 'education', open: 'education' }, { type: 'close' })
    expect(s).toEqual({ selected: 'education', open: null })
  })
  it('move while open changes nothing', () => {
    const open = { selected: 'bio', open: 'bio' } as const
    expect(uiReducer(open, { type: 'move', dir: 1 })).toEqual(open)
  })
})

describe('useScrollLock', () => {
  it('locks and restores on unlock', () => {
    document.documentElement.style.overflow = 'auto'
    const { rerender } = renderHook(({ l }) => useScrollLock(l), { initialProps: { l: true } })
    expect(document.documentElement.style.overflow).toBe('hidden')
    rerender({ l: false })
    expect(document.documentElement.style.overflow).toBe('auto')
  })
  it('restores on unmount', () => {
    document.documentElement.style.overflow = 'scroll'
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.documentElement.style.overflow).toBe('hidden')
    unmount()
    expect(document.documentElement.style.overflow).toBe('scroll')
  })
})
