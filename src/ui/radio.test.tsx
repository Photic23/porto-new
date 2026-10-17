import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Radio } from './Radio'
import { getAudio, getMusicState, resetMusic } from '@/audio/music'
import { content } from '@/content/content'

beforeEach(() => {
  resetMusic()
  vi.mocked(HTMLMediaElement.prototype.play).mockClear()
  vi.mocked(HTMLMediaElement.prototype.pause).mockClear()
})

describe('Radio', () => {
  it('starts closed', () => {
    render(<Radio />)
    expect(screen.getByRole('button', { name: 'open radio' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens to show the song, a play button and a volume slider', () => {
    render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    expect(screen.getByText(`${content.music.title} — ${content.music.artist}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'volume' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })

  it('play/pause drives the audio and follows its state', () => {
    render(<Radio initialOpen />)
    fireEvent.click(screen.getByRole('button', { name: 'play' }))
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
    act(() => void getAudio().dispatchEvent(new Event('play')))
    fireEvent.click(screen.getByRole('button', { name: 'pause' }))
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1)
  })

  it('the slider sets the volume', () => {
    render(<Radio initialOpen />)
    fireEvent.change(screen.getByRole('slider', { name: 'volume' }), { target: { value: '0.25' } })
    expect(getMusicState().volume).toBe(0.25)
    expect(getAudio().volume).toBe(0.25)
  })

  it('shows "song unavailable" when the file is missing', () => {
    render(<Radio initialOpen />)
    act(() => void getAudio().dispatchEvent(new Event('error')))
    expect(screen.getByText('song unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'play' })).toBeNull()
  })

  it('folds away when collapse turns on, and can reopen', () => {
    const { rerender } = render(<Radio initialOpen collapse={false} />)
    rerender(<Radio initialOpen collapse />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })

  it('starts folded when opened with collapse already on', () => {
    render(<Radio initialOpen collapse />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
  })

  it('has a progress bar that starts at 0, shows the time, and seeks', () => {
    render(<Radio initialOpen />)
    const a = getAudio()
    Object.defineProperty(a, 'duration', { value: 245, configurable: true })
    Object.defineProperty(a, 'currentTime', { value: 0, writable: true, configurable: true })
    act(() => void a.dispatchEvent(new Event('loadedmetadata')))
    const seek = screen.getByRole('slider', { name: 'seek' })
    expect(seek).toHaveValue('0')
    expect(seek).toHaveAttribute('max', '245')
    expect(screen.getByText('0:00 / 4:05')).toBeInTheDocument()
    fireEvent.change(seek, { target: { value: '120' } })
    expect(a.currentTime).toBe(120)
    expect(screen.getByText('2:00 / 4:05')).toBeInTheDocument()
  })

  it('keeps volume as its own, separately labelled slider', () => {
    render(<Radio initialOpen />)
    expect(screen.getByRole('slider', { name: 'volume' })).not.toBe(screen.getByRole('slider', { name: 'seek' }))
  })
})
