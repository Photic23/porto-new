/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const calls: Array<Record<string, unknown>> = []
vi.mock('@/scene/SceneCanvas', () => ({
  SceneCanvas: (p: Record<string, unknown>) => {
    calls.push(p)
    return <div data-testid="scene" />
  },
}))
vi.mock('next/dynamic', async () => {
  const React = await import('react')
  return {
    default: (loader: () => Promise<React.ComponentType<any>>) => {
      const Lazy = React.lazy(() => loader().then((C) => ({ default: C })))
      return function Dyn(props: Record<string, unknown>) {
        return (
          <React.Suspense fallback={null}>
            <Lazy {...props} />
          </React.Suspense>
        )
      }
    },
  }
})
const hasWebGL = vi.fn()
vi.mock('@/capability/detect', () => ({ hasWebGL: () => hasWebGL() }))
const reduced = vi.fn()
vi.mock('@/capability/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => reduced(),
}))

import { Experience } from './Experience'

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 3200,
    configurable: true,
  })
}
const last = () => calls[calls.length - 1]

beforeEach(() => {
  calls.length = 0
  hasWebGL.mockReset().mockReturnValue(true)
  reduced.mockReset().mockReturnValue(false)
  document.documentElement.style.overflow = ''
  setScroll(0)
})

describe('Experience', () => {
  it('renders the fallback when WebGL is unavailable', async () => {
    hasWebGL.mockReturnValue(false)
    render(<Experience />)
    expect(await screen.findByRole('heading', { level: 2, name: 'education' })).toBeTruthy()
    expect(screen.queryByTestId('scene')).toBeNull()
    expect(calls.length).toBe(0)
  })

  it('passes progress 1 when restored at max scroll', async () => {
    setScroll(2400)
    render(<Experience />)
    await screen.findByTestId('scene')
    expect(last().progress).toBe(1)
  })

  it('forces progress 1 with reduced motion', async () => {
    reduced.mockReturnValue(true)
    render(<Experience />)
    await screen.findByTestId('scene')
    expect(last().progress).toBe(1)
    expect(last().reducedMotion).toBe(true)
  })

  it('opens a section, locks scroll, and Esc closes it', async () => {
    setScroll(2400)
    render(<Experience />)
    await screen.findByTestId('scene')
    fireEvent.click(screen.getByRole('button', { name: /experience/ }))
    expect(screen.getByRole('button', { name: /back/ })).toBeTruthy()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(last().focus).toBe(1)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: /back/ })).toBeNull()
    expect(document.documentElement.style.overflow).not.toBe('hidden')
  })

  it('switches to fallback on context lost', async () => {
    render(<Experience />)
    await screen.findByTestId('scene')
    act(() => (last().onContextLost as () => void)())
    expect(screen.queryByTestId('scene')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'education' })).toBeTruthy()
  })
})
