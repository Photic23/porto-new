import { existsSync } from 'node:fs'
import { join } from 'node:path'
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
  it('plays a song file that actually exists in public/', () => {
    expect(content.music.title).toBe('Everything Goes On')
    expect(content.music.src).toMatch(/^\/music\/[\w-]+\.mp3$/)
    expect(existsSync(join(process.cwd(), 'public', content.music.src))).toBe(true)
  })
})
