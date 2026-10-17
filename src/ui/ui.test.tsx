import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, fireEvent } from '@testing-library/react'
import { TitleOverlay } from './TitleOverlay'
import { Menu } from './Menu'
import { SectionPage, EntryList } from './SectionPage'
import { content } from '@/content/content'
import type { Entry } from '@/content/types'

describe('TitleOverlay', () => {
  it('shows all copy at progress 0', () => {
    render(<TitleOverlay progress={0} />)
    expect(screen.getByText("hi, i'm kyse")).toBeInTheDocument()
    expect(screen.getByText('i write software & make little things')).toBeInTheDocument()
    expect(screen.getByText('▼ scroll to look down ▼')).toBeInTheDocument()
    expect(screen.queryByText(/LV\./)).toBeNull() // the decorative HUD was removed
  })
  it('fades title at progress 0.5 and hides prompt', () => {
    render(<TitleOverlay progress={0.5} />)
    const wrapper = screen.getByText("hi, i'm kyse").parentElement as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    expect(screen.queryByText('▼ scroll to look down ▼')).toBeNull()
  })
})

describe('Menu', () => {
  const state = { selected: 'bio', open: null } as const
  it('renders six buttons in order with selection marker', () => {
    render(<Menu state={state} dispatch={() => {}} visible />)
    const btns = screen.getAllByRole('button')
    expect(btns.map((b) => b.textContent)).toEqual(['▶ bio', 'education', 'experience', 'organization', 'projects', 'achievement'])
  })
  it('click dispatches open', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    fireEvent.click(screen.getByText('achievement'))
    expect(dispatch).toHaveBeenCalledWith({ type: 'open', id: 'achievement' })
  })
  it('keyboard moves and opens when visible', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'move', dir: 1 })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'move', dir: -1 })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'open' })
  })
  it('does not capture ArrowUp/ArrowDown (native scrolling)', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(true)
    expect(fireEvent.keyDown(window, { key: 'ArrowUp' })).toBe(true)
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('Enter on a focused button is left to native activation', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    const btn = screen.getByText('achievement')
    btn.focus()
    expect(fireEvent.keyDown(btn, { key: 'Enter' })).toBe(true) // not preventDefault-ed
    expect(dispatch).not.toHaveBeenCalled()
    fireEvent.click(btn) // what native Enter activation produces
    expect(dispatch).toHaveBeenCalledWith({ type: 'open', id: 'achievement' })
  })
  it('Enter with a link focused does not dispatch', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    const a = document.createElement('a')
    a.href = '#x'
    document.body.appendChild(a)
    expect(fireEvent.keyDown(a, { key: 'Enter' })).toBe(true)
    expect(dispatch).not.toHaveBeenCalled()
    a.remove()
  })
  it('ignores modifier-key combos', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true })
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('marks selected item aria-current', () => {
    render(<Menu state={state} dispatch={() => {}} visible />)
    expect(screen.getByText('▶ bio')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('education')).not.toHaveAttribute('aria-current')
  })
  it('focuses focusId button and reports it', () => {
    const onFocused = vi.fn()
    render(<Menu state={state} dispatch={() => {}} visible focusId="education" onFocused={onFocused} />)
    expect(screen.getByText('education')).toHaveFocus()
    expect(onFocused).toHaveBeenCalled()
  })
  it('ignores keys when not visible or when something is open', () => {
    const dispatch = vi.fn()
    const { rerender } = render(<Menu state={state} dispatch={dispatch} visible={false} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    rerender(<Menu state={{ selected: 'bio', open: 'bio' }} dispatch={dispatch} visible />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('SectionPage', () => {
  it('lists experience titles', () => {
    render(<SectionPage id="experience" onClose={() => {}} />)
    for (const e of content.experience) expect(screen.getByText(e.title)).toBeInTheDocument()
  })
  it('shows bio', () => {
    render(<SectionPage id="bio" onClose={() => {}} />)
    expect(screen.getByText(content.bio)).toBeInTheDocument()
  })
  it('focuses the back button on mount', () => {
    render(<SectionPage id="bio" onClose={() => {}} />)
    expect(screen.getByRole('button', { name: '◀ back' })).toHaveFocus()
  })
  it('bio sits inside the scroll container', () => {
    render(<SectionPage id="bio" onClose={() => {}} />)
    expect(screen.getByText(content.bio).parentElement!.className).toContain('scroll')
  })
  it('back button and Esc call onClose', () => {
    const onClose = vi.fn()
    render(<SectionPage id="bio" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '◀ back' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
  it('shows empty message when education is empty', async () => {
    vi.resetModules()
    vi.doMock('@/content/content', async () => {
      const real = await vi.importActual<typeof import('@/content/content')>('@/content/content')
      return { content: { ...real.content, education: [] } }
    })
    const { SectionPage: SP } = await import('./SectionPage')
    render(<SP id="education" onClose={() => {}} />)
    expect(screen.getByText('nothing here yet ✿')).toBeInTheDocument()
    vi.doUnmock('@/content/content')
  })
  it('20 entries render in the scrollable list class', () => {
    const entries: Entry[] = Array.from({ length: 20 }, (_, i) => ({ title: `entry ${i}` }))
    const { container } = render(<EntryList entries={entries} />)
    expect(screen.getAllByText(/^entry \d+$/)).toHaveLength(20)
    expect((container.firstElementChild as HTMLElement).className).toContain('entryList')
  })
})

describe('css', () => {
  const css = (f: string) => readFileSync(join(__dirname, f), 'utf8')
  it('radio container does not block taps', () => {
    const c = css('radio.module.css')
    expect(c).toMatch(/\.radio \{[^}]*pointer-events: none/)
    expect(c).toMatch(/\.button,\s*\.panel \{[^}]*pointer-events: auto/)
  })
})
