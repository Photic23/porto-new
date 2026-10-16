// Loads Spotify's official iFrame API once. Rejects if the script is blocked or slow.
// https://developer.spotify.com/documentation/embeds/references/iframe-api

export interface SpotifyEmbedController {
  play(): void
  destroy(): void
  addListener(event: 'ready', fn: () => void): void
}

export interface SpotifyIFrameAPI {
  createController(
    el: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void,
  ): void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
  }
}

const SRC = 'https://open.spotify.com/embed/iframe-api/v1'
const TIMEOUT_MS = 8000
let pending: Promise<SpotifyIFrameAPI> | null = null

export function loadSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (pending) return pending
  pending = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('spotify iframe api timed out')), TIMEOUT_MS)
    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timer)
      resolve(api)
    }
    const script = document.createElement('script')
    script.src = SRC
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('spotify iframe api failed to load'))
    }
    document.head.appendChild(script)
  })
  // Let a later call retry after a failure (e.g. a flaky network).
  pending.catch(() => {
    pending = null
  })
  return pending
}
