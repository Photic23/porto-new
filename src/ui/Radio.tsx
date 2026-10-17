'use client'
import { useState, useSyncExternalStore } from 'react'
import { content } from '@/content/content'
import { getMusicState, setMusicVolume, subscribeMusic, toggleMusic } from '@/audio/music'
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

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 8 8" width="20" height="20" shapeRendering="crispEdges" aria-hidden="true">
      {playing ? (
        <g fill="#5b4632">
          <rect x="1" y="1" width="2" height="6" />
          <rect x="5" y="1" width="2" height="6" />
        </g>
      ) : (
        <g fill="#5b4632">
          <rect x="2" y="1" width="1" height="6" />
          <rect x="3" y="2" width="1" height="4" />
          <rect x="4" y="2" width="1" height="4" />
          <rect x="5" y="3" width="1" height="2" />
          <rect x="6" y="3" width="1" height="2" />
        </g>
      )}
    </svg>
  )
}

export function Radio({
  initialOpen = false,
  collapse = false,
}: {
  initialOpen?: boolean
  /** When this turns on, fold the panel away (the music keeps playing). */
  collapse?: boolean
}) {
  // Already at the menu (e.g. reloaded at the bottom): keep the panel folded.
  const [open, setOpen] = useState(initialOpen && !collapse)
  const [prevCollapse, setPrevCollapse] = useState(collapse)
  if (collapse !== prevCollapse) {
    setPrevCollapse(collapse)
    if (collapse) setOpen(false)
  }
  const { playing, volume, error } = useSyncExternalStore(subscribeMusic, getMusicState, getMusicState)
  return (
    <div className={styles.radio}>
      <div className={styles.panel} hidden={!open} aria-hidden={!open}>
        <p className={styles.song}>
          {music.title} — {music.artist}
        </p>
        {error ? (
          <p className={styles.error}>song unavailable</p>
        ) : (
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.play}
              onClick={toggleMusic}
              aria-label={playing ? 'pause' : 'play'}
            >
              <PlayIcon playing={playing} />
            </button>
            <input
              type="range"
              className={styles.volume}
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              aria-label="volume"
            />
          </div>
        )}
      </div>
      <button
        type="button"
        className={`${styles.button} ${playing ? styles.on : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'close radio' : 'open radio'}
        aria-expanded={open}
      >
        <RadioIcon />
      </button>
    </div>
  )
}
