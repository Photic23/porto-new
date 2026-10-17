import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio } from './Radio'
import { soundcloudEmbedUrl } from '@/content/soundcloud'
import { content } from '@/content/content'

describe('soundcloudEmbedUrl', () => {
  const track = 'https://soundcloud.com/porter-robinson/mirror'
  it('builds the official widget url for a track', () => {
    const u = new URL(soundcloudEmbedUrl(track)!)
    expect(u.origin + u.pathname).toBe('https://w.soundcloud.com/player/')
    expect(u.searchParams.get('url')).toBe(track)
    expect(u.searchParams.get('auto_play')).toBe('false')
    expect(u.searchParams.get('visual')).toBe('false')
  })
  it('turns auto_play on when asked', () => {
    expect(new URL(soundcloudEmbedUrl(track, true)!).searchParams.get('auto_play')).toBe('true')
  })
  it('rejects urls that are not soundcloud tracks', () => {
    expect(soundcloudEmbedUrl('https://example.com/song')).toBeNull()
    expect(soundcloudEmbedUrl('https://open.spotify.com/track/abc')).toBeNull()
  })
})

describe('Radio', () => {
  const iframe = (c: HTMLElement) => c.querySelector('iframe') as HTMLIFrameElement | null

  it('starts closed with no player', () => {
    const { container } = render(<Radio />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    expect(iframe(container)).toBeNull()
  })

  it('opens the SoundCloud player (not autoplaying) and a fallback link', () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    const f = iframe(container)!
    expect(f.getAttribute('src')).toBe(soundcloudEmbedUrl(content.music.url, false))
    expect(f.getAttribute('title')).toBe('Mirror — Porter Robinson on SoundCloud')
    expect(f.getAttribute('allow')).toContain('autoplay')
    const link = screen.getByRole('link', { name: 'listen on soundcloud ↗' })
    expect(link).toHaveAttribute('href', content.music.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })

  it('autoPlay loads the player with auto_play on', () => {
    const { container } = render(<Radio initialOpen autoPlay />)
    expect(iframe(container)!.getAttribute('src')).toBe(soundcloudEmbedUrl(content.music.url, true))
  })

  it('keeps the player mounted but hides the panel on close', () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    fireEvent.click(screen.getByRole('button', { name: 'close radio' }))
    const panel = iframe(container)!.closest('[aria-hidden]') as HTMLElement
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('hidden')
  })

  it('collapses (player keeps playing) when collapse turns on, and can reopen', () => {
    const { container, rerender } = render(<Radio initialOpen collapse={false} />)
    rerender(<Radio initialOpen collapse />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    expect(iframe(container)).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })

  it('starts folded but loaded when opened with collapse already on', () => {
    const { container } = render(<Radio initialOpen collapse />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    expect(iframe(container)).not.toBeNull()
  })
})
