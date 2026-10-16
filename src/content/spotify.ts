// Converts an open.spotify.com track/album URL into its embed URL.
// Unrecognised URLs are returned unchanged.
export function spotifyEmbedUrl(url: string): string {
  const m = url.match(
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album)\/([A-Za-z0-9]+)/,
  )
  if (!m) return url
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`
}

// Converts an open.spotify.com track/album URL into a spotify: URI, or null if unrecognised.
export function spotifyUri(url: string): string | null {
  const m = url.match(
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album)\/([A-Za-z0-9]+)/,
  )
  return m ? `spotify:${m[1]}:${m[2]}` : null
}
