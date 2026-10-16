'use client'
import { useState } from 'react'
import { content } from '@/content/content'
import { spotifyEmbedUrl } from '@/content/spotify'
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

export function Radio() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const toggle = () => {
    setOpen((o) => !o)
    setMounted(true)
  }
  return (
    <div className={styles.radio}>
      {mounted && (
        <div className={styles.panel} hidden={!open} aria-hidden={!open}>
          <iframe
            title="Get Your Wish — Porter Robinson on Spotify"
            src={spotifyEmbedUrl(content.spotifyTrackUrl)}
            width="100%"
            height="80"
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, width: '100%' }}
          />
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
