import { describe, it, expect, vi } from 'vitest'
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
    expect(screen.getByText('♥♥♥ LV.22')).toBeInTheDocument()
    expect(screen.getByText('▼ scroll to look down ▼')).toBeInTheDocument()
  })
  it('fades title at progress 0.5, keeps HUD, hides prompt', () => {
    render(<TitleOverlay progress={0.5} />)
    const wrapper = screen.getByText("hi, i'm kyse").parentElement as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    expect(screen.getByText('♥♥♥ LV.22')).toBeInTheDocument()
    expect(screen.queryByText('▼ scroll to look down ▼')).toBeNull()
  })
})

describe('Menu', () => {
  const state = { selected: 'bio', open: null } as const
  it('renders four buttons in order with selection marker', () => {
    render(<Menu state={state} dispatch={() => {}} visible />)
    const btns = screen.getAllByRole('button')
    expect(btns.map((b) => b.textContent)).toEqual(['▶ bio', 'education', 'experience', 'competition'])
  })
  it('click dispatches open', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    fireEvent.click(screen.getByText('competition'))
    expect(dispatch).toHaveBeenCalledWith({ type: 'open', id: 'competition' })
  })
  it('keyboard moves and opens when visible', () => {
    const dispatch = vi.fn()
    render(<Menu state={state} dispatch={dispatch} visible />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'move', dir: 1 })
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'move', dir: -1 })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'open' })
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
