'use client'
import dynamic from 'next/dynamic'
import { useCallback, useReducer, useState, useSyncExternalStore } from 'react'
import { hasWebGL } from '@/capability/detect'
import { usePrefersReducedMotion } from '@/capability/usePrefersReducedMotion'
import { easeInOutQuad, scrollProgress } from '@/scene/cameraPath'
import type { SectionId } from '@/content/types'
import { initialUI, uiReducer, useScrollLock } from '@/state/uiState'
import { FallbackPage } from '@/ui/FallbackPage'
import { Menu } from '@/ui/Menu'
import { PressStart } from '@/ui/PressStart'
import { playMusic } from '@/audio/music'
import { Radio } from '@/ui/Radio'
import { SectionPage } from '@/ui/SectionPage'
import { Socials } from '@/ui/Socials'
import { TitleOverlay } from '@/ui/TitleOverlay'
import styles from '@/ui/ui.module.css'

const SceneCanvas = dynamic(() => import('@/scene/SceneCanvas').then((m) => m.SceneCanvas), {
  ssr: false,
})

const noopSubscribe = () => () => {}

function subscribeScroll(cb: () => void): () => void {
  let raf = 0
  const schedule = () => {
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0
        cb()
      })
    }
  }
  schedule() // re-read once after mount (layout may have changed since first render)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (raf) cancelAnimationFrame(raf)
  }
}

function getRawProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return scrollProgress(window.scrollY, max)
}

export function Experience() {
  // Probe once (it creates a context); client only, the server snapshot is null.
  const [probe] = useState<{ v: boolean | null }>(() => ({ v: null }))
  const getGl = () => (probe.v ??= hasWebGL())
  const probed = useSyncExternalStore<boolean | null>(noopSubscribe, getGl, () => null)
  const [lost, setLost] = useState(false)
  const [state, dispatch] = useReducer(uiReducer, initialUI)
  const [restoreId, setRestoreId] = useState<SectionId | null>(null)
  const clearRestore = useCallback(() => setRestoreId(null), [])
  const openSection = useCallback((id: SectionId) => dispatch({ type: 'open', id }), [])
  const raw = useSyncExternalStore(subscribeScroll, getRawProgress, () => 0)
  const reduced = usePrefersReducedMotion()
  const [started, setStarted] = useState(false)
  // Once a section has been opened the visitor has found the book: drop the hint.
  const [explored, setExplored] = useState(false)
  if (state.open && !explored) setExplored(true)

  const fallback = probed === false || lost
  useScrollLock(!started || (state.open !== null && !fallback))

  const spacer = reduced ? '100vh' : '400vh'

  // Keep the spacer in the DOM while probing so scrollHeight is realistic.
  if (probed === null) return <div style={{ height: spacer }} aria-hidden="true" />
  // play() must run inside the click itself (Safari), so start the song right here.
  const gate = !started && (
    <PressStart
      onStart={() => {
        void playMusic()
        setStarted(true)
      }}
    />
  )
  if (fallback)
    return (
      <>
        <FallbackPage radioOpen={started} />
        {gate}
      </>
    )

  const progress = reduced ? 1 : easeInOutQuad(raw)
  const atMenu = started && progress > 0.85 && state.open === null

  return (
    <>
      <SceneCanvas
        progress={progress}
        focus={state.open ? 1 : 0}
        reducedMotion={reduced}
        onContextLost={() => setLost(true)}
        navEnabled={atMenu}
        onSelectSection={openSection}
      />
      <div style={{ height: spacer }} aria-hidden="true" />
      <TitleOverlay progress={progress} prompt={started} />
      <Socials />
      {atMenu && !explored && <div className={styles.bookHint}>▲ pick a photo on the notebook ▲</div>}
      <Menu
        state={state}
        dispatch={dispatch}
        visible={atMenu}
        focusId={restoreId}
        onFocused={clearRestore}
      />
      {state.open && (
        <SectionPage
          id={state.open}
          onClose={() => {
            setRestoreId(state.open)
            dispatch({ type: 'close' })
          }}
        />
      )}
      <Radio
        key={started ? 'on' : 'off'}
        initialOpen={started}
        collapse={progress > 0.85}
      />
      {gate}
    </>
  )
}
