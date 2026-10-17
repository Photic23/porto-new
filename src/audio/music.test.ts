import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAudio,
  formatTime,
  getMusicState,
  playMusic,
  resetMusic,
  seekMusic,
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

  it('tracks progress and length from the element', () => {
    const a = getAudio()
    Object.defineProperty(a, 'duration', { value: 245, configurable: true })
    Object.defineProperty(a, 'currentTime', { value: 0, writable: true, configurable: true })
    a.dispatchEvent(new Event('loadedmetadata'))
    expect(getMusicState()).toMatchObject({ duration: 245, currentTime: 0 })
    a.currentTime = 83.4
    a.dispatchEvent(new Event('timeupdate'))
    expect(getMusicState().currentTime).toBeCloseTo(83.4)
  })

  it('seekMusic jumps within the song', () => {
    const a = getAudio()
    Object.defineProperty(a, 'duration', { value: 245, configurable: true })
    Object.defineProperty(a, 'currentTime', { value: 0, writable: true, configurable: true })
    a.dispatchEvent(new Event('loadedmetadata'))
    seekMusic(120)
    expect(a.currentTime).toBe(120)
    expect(getMusicState().currentTime).toBe(120)
    seekMusic(999)
    expect(a.currentTime).toBe(245)
    seekMusic(-5)
    expect(a.currentTime).toBe(0)
  })

  it('formats times as m:ss', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(83.9)).toBe('1:23')
    expect(formatTime(245)).toBe('4:05')
    expect(formatTime(NaN)).toBe('0:00')
  })
})
