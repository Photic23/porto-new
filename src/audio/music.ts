import { content } from '@/content/content'

// One shared <audio> for the site's song, served from /public. Created lazily on the
// client; nothing downloads until the first play (preload="none").
//
// Safari only lets sound start when play() is called inside the click itself, so
// call playMusic() directly from the "press start" click handler.

export const MUSIC_DEFAULT_VOLUME = 0.6

export interface MusicState {
  playing: boolean
  volume: number
  error: boolean
  /** Seconds into the song. */
  currentTime: number
  /** Song length in seconds; 0 until the file's metadata has loaded. */
  duration: number
}

const INITIAL: MusicState = {
  playing: false,
  volume: MUSIC_DEFAULT_VOLUME,
  error: false,
  currentTime: 0,
  duration: 0,
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0)

let audio: HTMLAudioElement | null = null
let state: MusicState = INITIAL
const listeners = new Set<() => void>()

function update(patch: Partial<MusicState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function getAudio(): HTMLAudioElement {
  if (!audio) {
    const a = new Audio()
    a.preload = 'none'
    a.loop = true
    a.volume = state.volume
    a.src = content.music.src
    a.addEventListener('play', () => update({ playing: true, error: false }))
    a.addEventListener('pause', () => update({ playing: false }))
    a.addEventListener('error', () => update({ playing: false, error: true }))
    const syncLength = () => update({ duration: finite(a.duration) })
    a.addEventListener('loadedmetadata', syncLength)
    a.addEventListener('durationchange', syncLength)
    a.addEventListener('timeupdate', () => update({ currentTime: finite(a.currentTime) }))
    audio = a
  }
  return audio
}

/** Starts the song. A blocked or failed play is ignored; the radio's button stays available. */
export function playMusic(): Promise<void> {
  return getAudio()
    .play()
    .catch(() => {})
}

export function toggleMusic() {
  if (state.playing) getAudio().pause()
  else void playMusic()
}

/** Jump to a point in the song (seconds), kept within the song's length. */
export function seekMusic(seconds: number) {
  const a = getAudio()
  const t = Math.min(state.duration || 0, Math.max(0, seconds))
  a.currentTime = t
  update({ currentTime: t })
}

/** 83.9 -> "1:23" */
export function formatTime(seconds: number): string {
  const s = Math.floor(finite(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function setMusicVolume(v: number) {
  const volume = Math.min(1, Math.max(0, v))
  getAudio().volume = volume
  update({ volume })
}

export function subscribeMusic(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getMusicState(): MusicState {
  return state
}

/** Test helper: forget the element and state. */
export function resetMusic() {
  audio?.pause()
  audio = null
  state = INITIAL
}
