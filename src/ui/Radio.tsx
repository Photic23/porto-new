'use client'
import { useEffect, useRef, useState } from 'react'
import { content } from '@/content/content'
import { spotifyEmbedUrl, spotifyUri } from '@/content/spotify'
import { loadSpotifyIframeApi } from '@/content/spotifyApi'
import styles from './radio.module.css'

function RadioIcon() {
  return (
    <svg viewBox="0 0 12 10" width="28" height="24" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="0" width="1" height="1" fill="#5b4632" />
      <rect x="2" y="1" width="1" height="1" fill="#5b4632" />
      <rect x="3" y="2" width="8" height="1" fill="#5b4632" />
      <rect x="0" y="3" width="12" height="7" fill="#5b4632" />
      <rect x="1" y="4" width="10" height="5" fill="#ffb3c8" />
      <rect x="2" y="5" width="4" height="3" fill="#2f5b7d" />
      <rect x="7" y="5" width="3" height="1" fill="#fbf7ee" />
      <rect x="7" y="7" width="3" height="1" fill="#e8828f" />
    </svg>
  )
}

const EMBED_TITLE = 'Get Your Wish — Porter Robinson on Spotify'

export function Radio({
  initialOpen = false,
  autoPlay = false,
}: {
  initialOpen?: boolean
  /** Ask Spotify's player to start as soon as it is ready (used right after "press start"). */
  autoPlay?: boolean
}) {
  const [open, setOpen] = useState(initialOpen)
  const [mounted, setMounted] = useState(initialOpen)
  const [plain, setPlain] = useState(false) // API unavailable: use the plain embed
  const host = useRef<HTMLDivElement>(null)
  const toggle = () => {
    setOpen((o) => !o)
    setMounted(true)
  }

  // Warm the API up early so it is ready by the time the visitor presses start.
  useEffect(() => {
    loadSpotifyIframeApi().catch(() => {})
  }, [])

  useEffect(() => {
    const uri = spotifyUri(content.spotifyTrackUrl)
    const node = host.current
    if (!mounted || !uri || !node) return
    let cancelled = false
    let controller: { destroy(): void } | null = null
    loadSpotifyIframeApi()
      .then((api) => {
        if (cancelled) return
        // Spotify replaces this element with its iframe; React never renders inside host.
        const el = document.createElement('div')
        node.appendChild(el)
        api.createController(el, { uri, width: '100%', height: 80 }, (c) => {
          if (cancelled) return c.destroy()
          controller = c
          node.querySelector('iframe')?.setAttribute('title', EMBED_TITLE)
          if (autoPlay) c.addListener('ready', () => c.play())
        })
      })
      .catch(() => {
        if (!cancelled) setPlain(true)
      })
    return () => {
      cancelled = true
      controller?.destroy()
      node.textContent = ''
    }
  }, [mounted, autoPlay])
  return (
    <div className={styles.radio}>
      {mounted && (
        <div className={styles.panel} hidden={!open} aria-hidden={!open}>
          {plain ? (
            <iframe
              title={EMBED_TITLE}
              src={spotifyEmbedUrl(content.spotifyTrackUrl)}
              width="100%"
              height="80"
              allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: 0, width: '100%' }}
            />
          ) : (
            <div ref={host} className={styles.embed} />
          )}
          <a
            className={styles.fallback}
            href={content.spotifyTrackUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            listen on spotify ↗
          </a>
        </div>
      )}
      <button
        type="button"
        className={styles.button}
        onClick={toggle}
        aria-label={open ? 'close radio' : 'open radio'}
        aria-expanded={open}
      >
        <RadioIcon />
      </button>
    </div>
  )
}
