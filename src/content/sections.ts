import type { Content, Entry, SectionId } from './types'

export const SECTIONS: readonly SectionId[] = [
  'bio',
  'education',
  'experience',
  'organization',
  'projects',
  'achievement',
]

export function sectionEntries(c: Content, id: SectionId): Entry[] {
  return id === 'bio' ? [] : c[id]
}
