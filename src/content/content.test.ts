import { describe, it, expect } from 'vitest'
import { content } from './content'
import { SECTIONS, sectionEntries } from './sections'

describe('content', () => {
  it('has the section list', () => {
    expect(SECTIONS).toEqual(['bio', 'education', 'experience', 'organization', 'projects', 'achievement'])
  })
  it('has name and tagline', () => {
    expect(content.name).toBe('kyse')
    expect(content.tagline).toBe("i write software & make little things")
  })
  it('every entry has a title', () => {
    for (const list of [content.education, content.experience, content.achievement]) {
      for (const e of list) expect(e.title.length).toBeGreaterThan(0)
    }
  })
  it('sectionEntries maps sections', () => {
    expect(sectionEntries(content, 'experience')).toBe(content.experience)
    expect(sectionEntries(content, 'bio')).toEqual([])
  })
  it('has a spotify url', () => {
    expect(content.spotifyTrackUrl).toMatch(/^https:\/\/open\.spotify\.com\/(track|album)\/[A-Za-z0-9]+/)
  })
})
