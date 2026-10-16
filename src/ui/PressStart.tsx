'use client'
import { useEffect, useRef } from 'react'
import styles from './ui.module.css'

// Full-screen gate: the visitor's first click is what lets the music play.
export function PressStart({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <button ref={ref} type="button" className={styles.pressStart} onClick={onStart} aria-label="press start">
      <span className={styles.pressStartLabel}>▶ press start</span>
    </button>
  )
}
