'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraPose, fitToAspect } from './cameraPath'
import { pixelSizeFor, tierFor, type Tier } from './sceneConfig'
import { World } from './World'

interface Props {
  progress: number
  focus: number
  reducedMotion: boolean
  onContextLost: () => void
}

function CameraRig({ progress, focus, reducedMotion }: Omit<Props, 'onContextLost'>) {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const focusRef = useRef(focus)
  const look = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    focusRef.current += (focus - focusRef.current) * (1 - Math.exp(-delta * 6))
    const pose = cameraPose(progress, focusRef.current)
    const lookAt = pose.lookAt
    // only near the notebook: the sky shot is fine at any aspect
    const position = fitToAspect(pose.position, lookAt, aspect, progress)
    if (!reducedMotion) {
      const t = state.clock.elapsedTime * 1000
      position[0] += Math.sin(t * 0.0004) * 0.3 * (1 - progress)
      position[1] += Math.sin(t * 0.0007) * 0.15
    }
    camera.position.set(position[0], position[1], position[2])
    look.current.set(lookAt[0], lookAt[1], lookAt[2])
    camera.lookAt(look.current)
  })
  return null
}

export function SceneCanvas({ progress, focus, reducedMotion, onContextLost }: Props) {
  const [tier, setTier] = useState<Tier | null>(null)
  const cleanup = useRef<(() => void) | null>(null)
  const lostRef = useRef(onContextLost)

  useEffect(() => {
    lostRef.current = onContextLost
  }, [onContextLost])

  useEffect(() => {
    const update = () => setTier(tierFor(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => () => cleanup.current?.(), [])

  if (!tier) return null

  return (
    <Canvas
      dpr={1 / pixelSizeFor(tier)}
      gl={{ antialias: false }}
      flat
      camera={{ fov: 55, near: 0.1, far: 400, position: [0, 6, 14] }}
      style={{ position: 'fixed', inset: 0, imageRendering: 'pixelated' }}
      onCreated={({ gl }) => {
        const el = gl.domElement
        const handler = (e: Event) => {
          e.preventDefault()
          lostRef.current()
        }
        el.addEventListener('webglcontextlost', handler)
        cleanup.current = () => el.removeEventListener('webglcontextlost', handler)
      }}
    >
      <CameraRig progress={progress} focus={focus} reducedMotion={reducedMotion} />
      <World tier={tier} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
