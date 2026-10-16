'use client'
import { useEffect } from 'react'
import { SECTIONS } from '@/content/sections'
import type { UIAction, UIState } from '@/state/uiState'
import styles from './ui.module.css'

export function Menu({
  state,
  dispatch,
  visible,
}: {
  state: UIState
  dispatch: (a: UIAction) => void
  visible: boolean
}) {
  const active = visible && state.open === null
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') dispatch({ type: 'move', dir: 1 })
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') dispatch({ type: 'move', dir: -1 })
      else if (e.key === 'Enter') dispatch({ type: 'open' })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, dispatch])

  if (!visible) return null
  return (
    <nav className={styles.menu} aria-label="sections">
      {SECTIONS.map((id) => {
        const sel = state.selected === id
        return (
          <button
            key={id}
            type="button"
            className={`${styles.menuItem} ${sel ? styles.selected : ''}`}
            onClick={() => dispatch({ type: 'open', id })}
          >
            {sel ? '▶ ' : ''}
            {id}
          </button>
        )
      })}
    </nav>
  )
}
