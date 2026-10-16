import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio } from './Radio'
import { spotifyEmbedUrl } from '@/content/spotify'
import { content } from '@/content/content'

describe('spotifyEmbedUrl', () => {
  it('converts a track url', () => {
    expect(spotifyEmbedUrl('https://open.spotify.com/track/abc123?si=x')).toBe(
      'https://open.spotify.com/embed/track/abc123?utm_source=generator',
    )
  })
  it('converts an album url', () => {
    expect(spotifyEmbedUrl('https://open.spotify.com/album/6fZfS2mCLxlXt4MVSedvXj')).toBe(
      'https://open.spotify.com/embed/album/6fZfS2mCLxlXt4MVSedvXj?utm_source=generator',
    )
  })
  it('handles intl-xx path segment', () => {
    expect(spotifyEmbedUrl('https://open.spotify.com/intl-fr/album/abc123?si=x')).toBe(
      'https://open.spotify.com/embed/album/abc123?utm_source=generator',
    )
  })
  it('returns unrecognised input unchanged', () => {
    expect(spotifyEmbedUrl('https://example.com/foo')).toBe('https://example.com/foo')
  })
})

describe('Radio', () => {
  const src = spotifyEmbedUrl(content.spotifyTrackUrl)
  it('starts closed with no iframe', () => {
    const { container } = render(<Radio />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    expect(container.querySelector('iframe')).toBeNull()
  })
  it('opens with iframe and fallback link', () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    const f = container.querySelector('iframe') as HTMLIFrameElement
    expect(f.getAttribute('src')).toBe(src)
    expect(f.getAttribute('height')).toBe('80')
    expect(f.getAttribute('allow')).toContain('autoplay; encrypted-media')
    const link = screen.getByRole('link', { name: 'listen on spotify ↗' })
    expect(link).toHaveAttribute('href', content.spotifyTrackUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })
  it('keeps iframe mounted but hides panel on close', () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    fireEvent.click(screen.getByRole('button', { name: 'close radio' }))
    const f = container.querySelector('iframe') as HTMLIFrameElement
    expect(f).toBeInTheDocument()
    const panel = f.closest('[aria-hidden]') as HTMLElement
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('hidden')
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
  })

  it('initialOpen mounts the open panel immediately', () => {
    const { container } = render(<Radio initialOpen />)
    expect(container.querySelector('iframe')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })
})
