import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const loadApi = vi.fn()
vi.mock('@/content/spotifyApi', () => ({ loadSpotifyIframeApi: () => loadApi() }))

import { Radio } from './Radio'
import { spotifyEmbedUrl, spotifyUri } from '@/content/spotify'
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

describe('spotifyUri', () => {
  it('converts track and album urls to spotify: uris', () => {
    expect(spotifyUri('https://open.spotify.com/track/abc123?si=x')).toBe('spotify:track:abc123')
    expect(spotifyUri('https://open.spotify.com/intl-fr/album/XyZ9')).toBe('spotify:album:XyZ9')
  })
  it('returns null for unrecognised urls', () => {
    expect(spotifyUri('https://example.com/foo')).toBeNull()
  })
})

// By default the Spotify iFrame API is unavailable, so Radio falls back to the plain embed.
beforeEach(() => {
  loadApi.mockReset().mockRejectedValue(new Error('blocked'))
})

describe('Radio', () => {
  const src = spotifyEmbedUrl(content.spotifyTrackUrl)
  it('starts closed with no iframe', () => {
    const { container } = render(<Radio />)
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
    expect(container.querySelector('iframe')).toBeNull()
  })
  const iframeIn = (c: HTMLElement) =>
    waitFor(() => {
      const f = c.querySelector('iframe')
      expect(f).not.toBeNull()
      return f as HTMLIFrameElement
    })
  it('falls back to the plain embed and link when the API is unavailable', async () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    const f = await iframeIn(container)
    expect(f.getAttribute('src')).toBe(src)
    expect(f.getAttribute('height')).toBe('80')
    expect(f.getAttribute('allow')).toContain('autoplay; encrypted-media')
    const link = screen.getByRole('link', { name: 'listen on spotify ↗' })
    expect(link).toHaveAttribute('href', content.spotifyTrackUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })
  it('keeps iframe mounted but hides panel on close', async () => {
    const { container } = render(<Radio />)
    fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
    await iframeIn(container)
    fireEvent.click(screen.getByRole('button', { name: 'close radio' }))
    const f = container.querySelector('iframe') as HTMLIFrameElement
    expect(f).toBeInTheDocument()
    const panel = f.closest('[aria-hidden]') as HTMLElement
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('hidden')
    expect(screen.getByRole('button', { name: 'open radio' })).toBeInTheDocument()
  })

  it('initialOpen mounts the open panel immediately', async () => {
    const { container } = render(<Radio initialOpen />)
    await iframeIn(container)
    expect(screen.getByRole('button', { name: 'close radio' })).toBeInTheDocument()
  })

  describe('with the Spotify iFrame API', () => {
    function fakeApi() {
      const listeners: Record<string, () => void> = {}
      const controller = {
        play: vi.fn(),
        destroy: vi.fn(),
        addListener: vi.fn((ev: string, fn: () => void) => (listeners[ev] = fn)),
      }
      const api = {
        createController: vi.fn(
          (el: HTMLElement, _opts: unknown, cb: (c: typeof controller) => void) => {
            el.replaceWith(Object.assign(document.createElement('iframe'), { src: 'x' }))
            cb(controller)
          },
        ),
      }
      loadApi.mockResolvedValue(api)
      return { api, controller, listeners }
    }

    it('autoPlay creates a controller for the uri and plays once it is ready', async () => {
      const { api, controller, listeners } = fakeApi()
      render(<Radio initialOpen autoPlay />)
      await waitFor(() => expect(api.createController).toHaveBeenCalled())
      expect(api.createController.mock.calls[0][1]).toMatchObject({
        uri: 'spotify:album:6fZfS2mCLxlXt4MVSedvXj',
      })
      expect(controller.play).not.toHaveBeenCalled()
      listeners.ready()
      expect(controller.play).toHaveBeenCalledTimes(1)
    })

    it('opening by hand does not autoplay', async () => {
      const { api, controller, listeners } = fakeApi()
      render(<Radio />)
      fireEvent.click(screen.getByRole('button', { name: 'open radio' }))
      await waitFor(() => expect(api.createController).toHaveBeenCalled())
      listeners.ready?.()
      expect(controller.play).not.toHaveBeenCalled()
    })

    it('destroys the controller on unmount', async () => {
      const { api, controller } = fakeApi()
      const { unmount } = render(<Radio initialOpen autoPlay />)
      await waitFor(() => expect(api.createController).toHaveBeenCalled())
      unmount()
      expect(controller.destroy).toHaveBeenCalled()
    })
  })
})
