'use client'
import { useState } from 'react'
import { content } from '@/content/content'
import { soundcloudEmbedUrl } from '@/content/soundcloud'
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

const { music } = content
const EMBED_TITLE = `${music.title} — ${music.artist} on SoundCloud`

export function Radio({
  initialOpen = false,
  autoPlay = false,
  collapse = false,
}: {
  initialOpen?: boolean
  /** Start playing as soon as the player loads (used right after "press start"). */
  autoPlay?: boolean
  /** When this turns on, fold the panel away (the player keeps playing). */
  collapse?: boolean
}) {
  // Already at the menu (e.g. reloaded at the bottom): load the player but keep it folded.
  const [open, setOpen] = useState(initialOpen && !collapse)
  const [prevCollapse, setPrevCollapse] = useState(collapse)
  if (collapse !== prevCollapse) {
    setPrevCollapse(collapse)
    if (collapse) setOpen(false)
  }
  const [mounted, setMounted] = useState(initialOpen)
  const toggle = () => {
    setOpen((o) => !o)
    setMounted(true)
  }
  // SoundCloud's widget honours auto_play once the visitor has clicked on the page.
  const src = soundcloudEmbedUrl(music.url, autoPlay)
  return (
    <div className={styles.radio}>
      {mounted && (
        <div className={styles.panel} hidden={!open} aria-hidden={!open}>
          {src && (
            <iframe
              title={EMBED_TITLE}
              src={src}
              width="100%"
              height="166"
              allow="autoplay"
              style={{ border: 0, width: '100%', display: 'block' }}
            />
          )}
          <a className={styles.fallback} href={music.url} target="_blank" rel="noopener noreferrer">
            listen on soundcloud ↗
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
