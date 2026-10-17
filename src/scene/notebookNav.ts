import type { SectionId } from '@/content/types'
import type { Vec3 } from './cameraPath'

// One clickable polaroid per section, in page-local coordinates (spine at x=0,
// left page x<0, right page x>0, z toward the camera is positive).
export interface NavPolaroid {
  id: SectionId
  pos: Vec3
  rot: number
  color: string
}

/** Polaroid footprint on the page: [width (x), depth (z)]. */
export const POLAROID_SIZE: readonly [number, number] = [0.95, 1.1]

// Three rows per page, zig-zagging between the spine and the outer edge so neither
// the photos nor their captions collide on small screens.
export const NAV_POLAROIDS: readonly NavPolaroid[] = [
  { id: 'bio', pos: [-1.0, 0.22, -1.2], rot: 0.1, color: '#ffb8c6' },
  { id: 'education', pos: [-2.0, 0.22, 0], rot: -0.12, color: '#9bd4f7' },
  { id: 'experience', pos: [-1.3, 0.22, 1.2], rot: 0.08, color: '#a6de8f' },
  { id: 'organization', pos: [1.4, 0.22, -1.2], rot: -0.1, color: '#c9b6f2' },
  { id: 'projects', pos: [2.0, 0.22, 0], rot: 0.12, color: '#ffc89a' },
  { id: 'achievement', pos: [1.3, 0.22, 1.2], rot: -0.08, color: '#ffe27a' },
]
