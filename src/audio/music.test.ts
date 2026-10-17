import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAudio,
  getMusicState,
  playMusic,
  resetMusic,
  setMusicVolume,
  subscribeMusic,
  toggleMusic,
  MUSIC_DEFAULT_VOLUME,
} from './music'
import { content } from '@/content/content'

beforeEach(() => {
  resetMusic()
  vi.mocked(HTMLMediaElement.prototype.play).mockClear()
  vi.mocked(HTMLMediaElement.prototype.pause).mockClear()
})

describe('music', () => {
  it('creates one looping audio element that only downloads when played', () => {
    const a = getAudio()
    expect(getAudio()).toBe(a)
    expect(a.src).toContain(content.music.src)
    expect(a.loop).toBe(true)
    expect(a.preload).toBe('none')
    expect(a.volume).toBeCloseTo(MUSIC_DEFAULT_VOLUME)
  })

  it('playMusic plays, and swallows a blocked-autoplay rejection', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('NotAllowedError'))
    await expect(playMusic()).resolves.toBeUndefined()
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  })

  it('tracks playing from the element events and notifies subscribers', () => {
    const fn = vi.fn()
    const unsub = subscribeMusic(fn)
    const a = getAudio()
    a.dispatchEvent(new Event('play'))
    expect(getMusicState().playing).toBe(true)
    a.dispatchEvent(new Event('pause'))
    expect(getMusicState().playing).toBe(false)
    expect(fn).toHaveBeenCalledTimes(2)
    unsub()
  })

  it('toggleMusic plays when paused and pauses when playing', () => {
    const a = getAudio()
    toggleMusic()
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
    a.dispatchEvent(new Event('play'))
    toggleMusic()
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1)
  })

  it('clamps and applies the volume', () => {
    setMusicVolume(1.7)
    expect(getMusicState().volume).toBe(1)
    setMusicVolume(-1)
    expect(getMusicState().volume).toBe(0)
    expect(getAudio().volume).toBe(0)
  })

  it('reports a missing or broken file', () => {
    getAudio().dispatchEvent(new Event('error'))
    expect(getMusicState()).toMatchObject({ playing: false, error: true })
  })
})
