'use client'

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SectionId } from '@/content/types'
import { NAV_POLAROIDS, POLAROID_SIZE, type NavPolaroid } from './notebookNav'
import styles from './notebook.module.css'
import { mulberry32 } from './rng'
import { sceneConfig, type Tier } from './sceneConfig'
import { groundHeight, NOTEBOOK_POS } from './terrain'

const Sky = memo(function Sky() {
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
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <>
      <primitive object={texture} attach="background" />
      <fog attach="fog" args={['#dff0fb', 40, 130]} />
    </>
  )
})

const Sun = memo(function Sun() {
  return (
    <mesh position={[40, 70, -110]}>
      <icosahedronGeometry args={[6, 1]} />
      <meshBasicMaterial color="#fff6b8" fog={false} />
    </mesh>
  )
})

const Ground = memo(function Ground({ segments }: { segments: number }) {
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
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  )
})

interface InstanceItem {
  pos: [number, number, number]
  scale: number
  color: string
}

// One draw call for many copies of a shared geometry and material.
function Instanced({ items, children }: { items: InstanceItem[]; children: React.ReactNode }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    items.forEach((it, i) => {
      dummy.position.set(it.pos[0], it.pos[1], it.pos[2])
      dummy.scale.setScalar(it.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, color.set(it.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items])
  return (
    <instancedMesh key={items.length} ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      {children}
    </instancedMesh>
  )
}

const Trees = memo(function Trees({ count }: { count: number }) {
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
  const trunks = useMemo(
    () => trees.map((t) => ({ pos: [t.x, t.y + t.s, t.z] as [number, number, number], scale: t.s, color: '#ffffff' })),
    [trees],
  )
  const canopies = useMemo(
    () =>
      trees.map((t) => ({
        pos: [t.x, t.y + 3.2 * t.s, t.z] as [number, number, number],
        scale: t.s,
        color: t.pink ? '#ffb3c8' : '#4f9e4c',
      })),
    [trees],
  )
  return (
    <>
      <Instanced items={trunks}>
        <cylinderGeometry args={[0.3, 0.4, 2, 5]} />
        <meshLambertMaterial color="#8a6a4a" flatShading />
      </Instanced>
      <Instanced items={canopies}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshLambertMaterial flatShading />
      </Instanced>
    </>
  )
})

const FLOWER_COLORS = ['#ff9ec0', '#ffffff', '#ffe27a']

const Flowers = memo(function Flowers({ count }: { count: number }) {
  const flowers = useMemo(() => {
    const rand = mulberry32(303)
    return Array.from({ length: count }, (_, i) => {
      const x = (rand() - 0.5) * 50
      const z = (rand() - 0.5) * 40 - 6
      return {
        pos: [x, groundHeight(x, z) + 0.12, z] as [number, number, number],
        scale: 1,
        color: FLOWER_COLORS[i % 3],
      }
    })
  }, [count])
  return (
    <Instanced items={flowers}>
      <icosahedronGeometry args={[0.12, 0]} />
      <meshLambertMaterial />
    </Instanced>
  )
})

interface CloudData {
  x: number
  y: number
  z: number
  v: number
  puffs: { r: number; pos: [number, number, number] }[]
}

const Clouds = memo(function Clouds({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const puffGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])
  const puffMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true, emissive: '#ffffff', emissiveIntensity: 0.5 }),
    [],
  )
  useEffect(
    () => () => {
      puffGeo.dispose()
      puffMat.dispose()
    },
    [puffGeo, puffMat],
  )
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
            <mesh key={j} position={p.pos} scale={p.r} geometry={puffGeo} material={puffMat} />
          ))}
        </group>
      ))}
    </>
  )
})

type SelectSection = (id: SectionId) => void

// A section's polaroid: click the photo or its caption to open the section.
const Polaroid = memo(function Polaroid({
  p,
  enabled,
  onSelect,
}: {
  p: NavPolaroid
  enabled: boolean
  onSelect: SelectSection
}) {
  const [hover, setHover] = useState(false)
  const hot = enabled && hover
  useEffect(() => {
    if (!hot) return
    document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hot])
  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(p.id)
  }
  return (
    <group
      position={[p.pos[0], p.pos[1] + (hot ? 0.12 : 0), p.pos[2]]}
      rotation={[0, p.rot, 0]}
      onClick={enabled ? select : undefined}
      onPointerOver={enabled ? (e) => (e.stopPropagation(), setHover(true)) : undefined}
      onPointerOut={() => setHover(false)}
    >
      <mesh>
        <boxGeometry args={[POLAROID_SIZE[0], 0.03, POLAROID_SIZE[1]]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.005, -0.1]}>
        <boxGeometry args={[POLAROID_SIZE[0] - 0.15, 0.035, POLAROID_SIZE[1] - 0.4]} />
        <meshLambertMaterial color={p.color} />
      </mesh>
      {enabled && (
        <Html position={[0, 0.05, POLAROID_SIZE[1] / 2 - 0.13]} center zIndexRange={[5, 0]}>
          <button
            type="button"
            className={styles.caption}
            onClick={(e) => {
              e.stopPropagation() // don't also trigger the 3D click underneath
              onSelect(p.id)
            }}
          >
            <span className={styles.label}>{p.id}</span>
          </button>
        </Html>
      )}
    </group>
  )
})

const Notebook = memo(function Notebook({
  navEnabled,
  onSelectSection,
}: {
  navEnabled: boolean
  onSelectSection: SelectSection
}) {
  return (
    // Faces the camera square-on so both pages read the same size; pages tilt up
    // from the spine (like a real open book) so their outer edges stay above the grass.
    <group position={NOTEBOOK_POS}>
      {[-1, 1].map((side) => (
        <group key={side} rotation={[0, 0, side * 0.06]}>
          <mesh position={[side * 1.5, 0, 0]}>
            <boxGeometry args={[3, 0.08, 4]} />
            <meshLambertMaterial color="#e8828f" flatShading />
          </mesh>
          <mesh position={[side * 1.5, 0.1, 0]}>
            <boxGeometry args={[2.85, 0.14, 3.85]} />
            <meshLambertMaterial color="#fbf7ee" />
          </mesh>
          {/* polaroids ride on their page so they follow its tilt */}
          {NAV_POLAROIDS.filter((p) => Math.sign(p.pos[0]) === side).map((p) => (
            <Polaroid key={p.id} p={p} enabled={navEnabled} onSelect={onSelectSection} />
          ))}
        </group>
      ))}
    </group>
  )
})

export const World = memo(function World({
  tier,
  reducedMotion,
  navEnabled,
  onSelectSection,
}: {
  tier: Tier
  reducedMotion: boolean
  navEnabled: boolean
  onSelectSection: SelectSection
}) {
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
      <Notebook navEnabled={navEnabled} onSelectSection={onSelectSection} />
    </>
  )
})
