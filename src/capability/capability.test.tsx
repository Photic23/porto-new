import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { hasWebGL } from './detect'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { FallbackPage } from '@/ui/FallbackPage'

function docWith(getContext: () => unknown): Document {
  return { createElement: () => ({ getContext }) } as unknown as Document
}

describe('hasWebGL', () => {
  it('is false when getContext returns null', () => {
    expect(hasWebGL(docWith(() => null))).toBe(false)
  })
  it('is false when getContext throws', () => {
    expect(hasWebGL(docWith(() => { throw new Error('no') }))).toBe(false)
  })
  it('is true when getContext returns an object', () => {
    expect(hasWebGL(docWith(() => ({})))).toBe(true)
  })
})

describe('hasWebGL release', () => {
  it('calls loseContext when available', () => {
    const loseContext = vi.fn()
    const ctx = { getExtension: () => ({ loseContext }) }
    expect(hasWebGL(docWith(() => ctx))).toBe(true)
    expect(loseContext).toHaveBeenCalled()
  })
})

describe('usePrefersReducedMotion', () => {
  afterEach(() => { vi.unstubAllGlobals() })
  it('follows matchMedia and updates on change', () => {
    let listener: ((e: { matches: boolean }) => void) | null = null
    const mql = {
      matches: true,
      addEventListener: (_: string, l: (e: { matches: boolean }) => void) => { listener = l },
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('matchMedia', () => mql)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
    mql.matches = false
    act(() => listener!({ matches: false }))
    expect(result.current).toBe(false)
  })
})

describe('FallbackPage', () => {
  it('shows the title and the four section headings in order', () => {
    render(<FallbackPage />)
    expect(screen.getByText("hi, i'm kyse")).toBeInTheDocument()
    const heads = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(heads).toEqual(['bio', 'education', 'experience', 'achievement'])
  })
})
