'use client'
import { useEffect, useRef } from 'react'
import type { SectionId } from '@/content/types'
import { SECTIONS } from '@/content/sections'
import type { UIAction, UIState } from '@/state/uiState'
import styles from './ui.module.css'

export function Menu({
  state,
  dispatch,
  visible,
  focusId = null,
  onFocused,
}: {
  state: UIState
  dispatch: (a: UIAction) => void
  visible: boolean
  focusId?: SectionId | null
  onFocused?: () => void
}) {
  const refs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({})
  const active = visible && state.open === null
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as Element | null
      if (t?.closest?.('button, a, input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowRight') dispatch({ type: 'move', dir: 1 })
      else if (e.key === 'ArrowLeft') dispatch({ type: 'move', dir: -1 })
      else if (e.key === 'Enter') dispatch({ type: 'open' })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, dispatch])

  const shown = visible && state.open === null
  useEffect(() => {
    if (shown && focusId) {
      refs.current[focusId]?.focus()
      onFocused?.()
    }
  }, [shown, focusId, onFocused])

  if (!visible) return null
  return (
    <nav className={styles.menu} aria-label="sections">
      {SECTIONS.map((id) => {
        const sel = state.selected === id
        return (
          <button
            key={id}
            type="button"
            ref={(el) => {
              refs.current[id] = el
            }}
            aria-current={sel ? 'true' : undefined}
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
