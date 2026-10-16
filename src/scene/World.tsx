'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from './rng'
import { sceneConfig, type Tier } from './sceneConfig'
import { groundHeight, NOTEBOOK_POS } from './terrain'

function Sky() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 2
    c.height = 256
    const ctx = c.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#3f8fd8')
    grad.addColorStop(0.5, '#8ccaf4')
    grad.addColorStop(0.8, '#cfeafc')
    grad.addColorStop(1, '#fff1d6')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  return (
    <>
      <primitive object={texture} attach="background" />
      <fog attach="fog" args={['#dff0fb', 40, 130]} />
    </>
  )
}

function Sun() {
  return (
    <mesh position={[40, 70, -110]}>
      <icosahedronGeometry args={[6, 1]} />
      <meshBasicMaterial color="#fff6b8" fog={false} />
    </mesh>
  )
}

function Ground({ segments }: { segments: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(260, 260, segments, segments)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const rand = mulberry32(101)
    const palette = [new THREE.Color('#8fd17a'), new THREE.Color('#6fbf5e'), new THREE.Color('#a6de8f')]
    const colors: number[] = []
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, groundHeight(pos.getX(i), pos.getZ(i)))
      const t = rand()
      const c = palette[t < 0.33 ? 0 : t < 0.66 ? 1 : 2]
      colors.push(c.r, c.g, c.b)
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [segments])
  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  )
}

function Trees({ count }: { count: number }) {
  const trees = useMemo(() => {
    const rand = mulberry32(202)
    const out: { x: number; y: number; z: number; s: number; pink: boolean }[] = []
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * 200
      const z = -rand() * 120 + 20
      const s = 0.8 + rand() * 1.2
      const pink = rand() < 0.2
      if (Math.hypot(x, z + 6) < 16) continue
      out.push({ x, y: groundHeight(x, z), z, s, pink })
    }
    return out
  }, [count])
  return (
    <>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]} scale={t.s}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 2, 5]} />
            <meshLambertMaterial color="#8a6a4a" flatShading />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <icosahedronGeometry args={[1.8, 0]} />
            <meshLambertMaterial color={t.pink ? '#ffb3c8' : '#4f9e4c'} flatShading />
          </mesh>
        </group>
      ))}
    </>
  )
}

const FLOWER_COLORS = ['#ff9ec0', '#ffffff', '#ffe27a']

function Flowers({ count }: { count: number }) {
  const flowers = useMemo(() => {
    const rand = mulberry32(303)
    return Array.from({ length: count }, (_, i) => {
      const x = (rand() - 0.5) * 50
      const z = (rand() - 0.5) * 40 - 6
      return { x, y: groundHeight(x, z) + 0.12, z, color: FLOWER_COLORS[i % 3] }
    })
  }, [count])
  return (
    <>
      {flowers.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]}>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshLambertMaterial color={f.color} />
        </mesh>
      ))}
    </>
  )
}

interface CloudData {
  x: number
  y: number
  z: number
  v: number
  puffs: { r: number; pos: [number, number, number] }[]
}

function Clouds({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const clouds = useMemo<CloudData[]>(() => {
    const rand = mulberry32(404)
    return Array.from({ length: count }, () => {
      const n = 3 + Math.floor(rand() * 4)
      const puffs = Array.from({ length: n }, (_, j) => ({
        r: 2 + rand() * 2,
        pos: [j * 2.6 - n, rand() * 1.2, rand() * 2] as [number, number, number],
      }))
      return {
        puffs,
        x: (rand() - 0.5) * 160,
        y: 28 + rand() * 25,
        z: -rand() * 120 + 10,
        v: 0.01 + rand() * 0.02,
      }
    })
  }, [count])

  useFrame((_, delta) => {
    if (reducedMotion) return
    refs.current.forEach((g, i) => {
      if (!g || !clouds[i]) return
      g.position.x += clouds[i].v * delta * 60
      if (g.position.x > 90) g.position.x = -90
    })
  })

  return (
    <>
      {clouds.map((c, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          position={[c.x, c.y, c.z]}
        >
          {c.puffs.map((p, j) => (
            <mesh key={j} position={p.pos}>
              <icosahedronGeometry args={[p.r, 0]} />
              <meshLambertMaterial color="#ffffff" flatShading emissive="#9cb8d0" emissiveIntensity={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

const POLAROIDS: { pos: [number, number, number]; rot: number; color: string }[] = [
  { pos: [-2.2, 0.22, -0.8], rot: 0.15, color: '#9bd4f7' },
  { pos: [-1.0, 0.22, 0.7], rot: -0.2, color: '#a6de8f' },
  { pos: [1.6, 0.22, -0.6], rot: 0.1, color: '#ffb8c6' },
]

function Notebook() {
  return (
    <group position={NOTEBOOK_POS} rotation={[0, -0.15, 0]}>
      {[-1, 1].map((side) => (
        <group key={side} rotation={[0, 0, -side * 0.08]}>
          <mesh position={[side * 1.5, 0, 0]}>
            <boxGeometry args={[3, 0.08, 4]} />
            <meshLambertMaterial color="#e8828f" flatShading />
          </mesh>
          <mesh position={[side * 1.5, 0.1, 0]}>
            <boxGeometry args={[2.85, 0.14, 3.85]} />
            <meshLambertMaterial color="#fbf7ee" />
          </mesh>
        </group>
      ))}
      {POLAROIDS.map((p, i) => (
        <group key={i} position={p.pos} rotation={[0, p.rot, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.03, 1.05]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.005, -0.1]}>
            <boxGeometry args={[0.75, 0.035, 0.7]} />
            <meshLambertMaterial color={p.color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function World({ tier, reducedMotion }: { tier: Tier; reducedMotion: boolean }) {
  const cfg = sceneConfig(tier)
  return (
    <>
      <Sky />
      <hemisphereLight args={['#cfeafc', '#6fbf5e', 1.1]} />
      <directionalLight color="#fff1d0" intensity={1.6} position={[30, 50, 20]} />
      <Sun />
      <Ground segments={cfg.groundSegments} />
      <Trees count={cfg.trees} />
      <Flowers count={cfg.flowers} />
      <Clouds count={cfg.clouds} reducedMotion={reducedMotion} />
      <Notebook />
    </>
  )
}
