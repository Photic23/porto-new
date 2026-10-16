'use client'
import dynamic from 'next/dynamic'
import { useReducer, useState, useSyncExternalStore } from 'react'
import { hasWebGL } from '@/capability/detect'
import { usePrefersReducedMotion } from '@/capability/usePrefersReducedMotion'
import { easeInOutQuad, scrollProgress } from '@/scene/cameraPath'
import { initialUI, uiReducer, useScrollLock } from '@/state/uiState'
import { FallbackPage } from '@/ui/FallbackPage'
import { Menu } from '@/ui/Menu'
import { Radio } from '@/ui/Radio'
import { SectionPage } from '@/ui/SectionPage'
import { TitleOverlay } from '@/ui/TitleOverlay'

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
  const raw = useSyncExternalStore(subscribeScroll, getRawProgress, () => 0)
  const reduced = usePrefersReducedMotion()

  useScrollLock(state.open !== null)

  if (probed === null) return null
  if (!probed || lost) return <FallbackPage />

  const progress = reduced ? 1 : easeInOutQuad(raw)

  return (
    <>
      <SceneCanvas
        progress={progress}
        focus={state.open ? 1 : 0}
        reducedMotion={reduced}
        onContextLost={() => setLost(true)}
      />
      <div style={{ height: '400vh' }} aria-hidden="true" />
      <TitleOverlay progress={progress} />
      <Menu state={state} dispatch={dispatch} visible={progress > 0.85} />
      {state.open && <SectionPage id={state.open} onClose={() => dispatch({ type: 'close' })} />}
      <Radio />
    </>
  )
}
