/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'

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
const start = async () =>
  fireEvent.click(await screen.findByRole('button', { name: /press start/ }))

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
    await start()
    fireEvent.click(screen.getByRole('button', { name: /experience/ }))
    expect(screen.getByRole('button', { name: /back/ })).toBeTruthy()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(last().focus).toBe(1)
    expect(screen.queryByRole('navigation')).toBeNull() // menu hidden while open
    expect(screen.getByRole('button', { name: /back/ })).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: /back/ })).toBeNull()
    expect(screen.getByRole('button', { name: /experience/ })).toHaveFocus() // focus returns
    expect(document.documentElement.style.overflow).not.toBe('hidden')
  })

  it('uses a 100vh spacer under reduced motion', async () => {
    reduced.mockReturnValue(true)
    const { container } = render(<Experience />)
    await screen.findByTestId('scene')
    const spacer = container.querySelector('div[aria-hidden="true"]') as HTMLElement
    expect(spacer.style.height).toBe('100vh')
  })

  it('switches to fallback on context lost', async () => {
    render(<Experience />)
    await screen.findByTestId('scene')
    act(() => (last().onContextLost as () => void)())
    expect(screen.queryByTestId('scene')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'education' })).toBeTruthy()
  })

  it('starts at progress 0 at the top and hides the menu', async () => {
    render(<Experience />)
    await screen.findByTestId('scene')
    expect(last().progress).toBe(0)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('reads a realistic layout: spacer present from first render', async () => {
    // scrollHeight is 0 until the spacer exists, like a real browser
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => (document.querySelector('div[aria-hidden="true"]') ? 3200 : 0),
    })
    render(<Experience />)
    await screen.findByTestId('scene')
    await waitFor(() => expect(last().progress).toBe(0))
  })

  it('updates progress on scroll and resize, showing the menu above 0.85', async () => {
    render(<Experience />)
    await screen.findByTestId('scene')
    await start()
    setScroll(1200)
    fireEvent.scroll(window)
    await waitFor(() => expect(last().progress).toBe(0.5))
    expect(screen.queryByRole('navigation')).toBeNull()
    setScroll(2400)
    fireEvent(window, new Event('resize'))
    await waitFor(() => expect(last().progress).toBe(1))
    expect(screen.getByRole('navigation')).toBeTruthy()
  })

  it('removes listeners on unmount', async () => {
    const rm = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Experience />)
    await screen.findByTestId('scene')
    unmount()
    const names = rm.mock.calls.map((c) => c[0])
    expect(names).toContain('scroll')
    expect(names).toContain('resize')
    rm.mockRestore()
  })

  it('releases the scroll lock when the context is lost with a section open', async () => {
    setScroll(2400)
    render(<Experience />)
    await screen.findByTestId('scene')
    await start()
    fireEvent.click(screen.getByRole('button', { name: /experience/ }))
    expect(document.documentElement.style.overflow).toBe('hidden')
    act(() => (last().onContextLost as () => void)())
    expect(document.documentElement.style.overflow).not.toBe('hidden')
  })

  describe('press start', () => {
    it('gates the page: focused button, scroll locked, no menu or scroll prompt', async () => {
      setScroll(2400)
      render(<Experience />)
      await screen.findByTestId('scene')
      const btn = await screen.findByRole('button', { name: /press start/ })
      expect(btn).toHaveFocus()
      expect(document.documentElement.style.overflow).toBe('hidden')
      expect(screen.queryByRole('navigation')).toBeNull()
      expect(screen.queryByText(/scroll to look down/)).toBeNull()
    })

    it('starting plays the song inside the click, unlocks scroll, opens the radio', async () => {
      render(<Experience />)
      await screen.findByTestId('scene')
      vi.mocked(HTMLMediaElement.prototype.play).mockClear()
      await start()
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('button', { name: /press start/ })).toBeNull()
      expect(document.documentElement.style.overflow).not.toBe('hidden')
      expect(screen.getByRole('button', { name: 'close radio' })).toBeTruthy()
      expect(screen.getByText(/scroll to look down/)).toBeTruthy()
    })

    it('gates the fallback page too, and opens its radio on start', async () => {
      hasWebGL.mockReturnValue(false)
      render(<Experience />)
      vi.mocked(HTMLMediaElement.prototype.play).mockClear()
      await start()
      expect(screen.getByRole('heading', { level: 2, name: 'education' })).toBeTruthy()
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('button', { name: 'close radio' })).toBeTruthy()
      expect(document.documentElement.style.overflow).not.toBe('hidden')
    })
  
    it('collapses the radio when the menu appears', async () => {
      render(<Experience />)
      await screen.findByTestId('scene')
      await start()
      expect(screen.getByRole('button', { name: 'close radio' })).toBeTruthy()
      setScroll(2400)
      fireEvent.scroll(window)
      await waitFor(() => expect(screen.getByRole('navigation')).toBeTruthy())
      expect(screen.getByRole('button', { name: 'open radio' })).toBeTruthy()
    })
  })

  describe('book navigation', () => {
    it('enables the polaroids only at the notebook, after start, with no section open', async () => {
      setScroll(2400)
      render(<Experience />)
      await screen.findByTestId('scene')
      expect(last().navEnabled).toBe(false) // press start still showing
      await start()
      await waitFor(() => expect(last().navEnabled).toBe(true))
      fireEvent.click(screen.getByRole('button', { name: /experience/ }))
      expect(last().navEnabled).toBe(false) // section open
    })

    it('is disabled up in the sky', async () => {
      render(<Experience />)
      await screen.findByTestId('scene')
      await start()
      expect(last().navEnabled).toBe(false)
    })

    it('clicking a polaroid opens its section', async () => {
      setScroll(2400)
      render(<Experience />)
      await screen.findByTestId('scene')
      await start()
      act(() => (last().onSelectSection as (id: string) => void)('achievement'))
      expect(screen.getByRole('heading', { name: 'achievement' })).toBeTruthy()
      expect(last().focus).toBe(1)
    })
  })

  describe('book hint', () => {
    const hint = () => screen.queryByText(/pick a photo on the notebook/)

    it('shows at the notebook after start', async () => {
      setScroll(2400)
      render(<Experience />)
      await screen.findByTestId('scene')
      expect(hint()).toBeNull() // press start still up
      await start()
      await waitFor(() => expect(hint()).toBeTruthy())
    })

    it('is hidden up in the sky', async () => {
      render(<Experience />)
      await screen.findByTestId('scene')
      await start()
      expect(hint()).toBeNull()
    })

    it('goes away for good once a section has been opened', async () => {
      setScroll(2400)
      render(<Experience />)
      await screen.findByTestId('scene')
      await start()
      await waitFor(() => expect(hint()).toBeTruthy())
      act(() => (last().onSelectSection as (id: string) => void)('bio'))
      expect(hint()).toBeNull()
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(screen.getByRole('navigation')).toBeTruthy() // back at the menu
      expect(hint()).toBeNull()
    })
  })

  it('shows the social links on the 3D page and the fallback page', async () => {
    const { unmount } = render(<Experience />)
    await screen.findByTestId('scene')
    expect(screen.getByRole('link', { name: /tiktok/i })).toBeTruthy()
    unmount()
    hasWebGL.mockReturnValue(false)
    render(<Experience />)
    expect(await screen.findByRole('link', { name: /tiktok/i })).toBeTruthy()
  })
})
