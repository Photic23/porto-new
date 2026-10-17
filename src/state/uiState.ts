'use client'
import { useEffect } from 'react'
import type { SectionId } from '@/content/types'
import { SECTIONS } from '@/content/sections'

export interface UIState {
  selected: SectionId
  open: SectionId | null
}

export type UIAction =
  | { type: 'select'; id: SectionId }
  | { type: 'move'; dir: 1 | -1 }
  | { type: 'open'; id?: SectionId }
  | { type: 'close' }

export const initialUI: UIState = { selected: 'bio', open: null }

export function uiReducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'select':
      return { ...s, selected: a.id }
    case 'move': {
      if (s.open !== null) return s
      const i = SECTIONS.indexOf(s.selected)
      const n = SECTIONS.length
      return { ...s, selected: SECTIONS[(i + a.dir + n) % n] }
    }
    case 'open': {
      const id = a.id ?? s.selected
      return { selected: id, open: id }
    }
    case 'close':
      return { ...s, open: null }
  }
}

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const el = document.documentElement
    const prev = el.style.overflow
    el.style.overflow = 'hidden'
    return () => {
      el.style.overflow = prev
    }
  }, [locked])
}
