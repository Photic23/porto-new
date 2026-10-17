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

// Short captions (bio, experience) sit near the spine and long ones (education,
// competition) at the outer edges, so captions don't collide on small screens.
export const NAV_POLAROIDS: readonly NavPolaroid[] = [
  { id: 'bio', pos: [-1.1, 0.22, -0.8], rot: 0.12, color: '#ffb8c6' },
  { id: 'education', pos: [-2.0, 0.22, 0.7], rot: -0.15, color: '#9bd4f7' },
  { id: 'experience', pos: [1.1, 0.22, -0.8], rot: -0.1, color: '#a6de8f' },
  { id: 'competition', pos: [2.0, 0.22, 0.7], rot: 0.14, color: '#ffe27a' },
]
