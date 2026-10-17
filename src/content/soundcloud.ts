// Builds the official SoundCloud widget URL for a track, or null if the URL isn't a
// soundcloud.com track. https://developers.soundcloud.com/docs/api/html5-widget
export function soundcloudEmbedUrl(trackUrl: string, autoPlay = false): string | null {
  if (!/^https:\/\/soundcloud\.com\/[\w-]+\/[\w-]+\/?$/.test(trackUrl)) return null
  const params = new URLSearchParams({
    url: trackUrl,
    color: '#e8828f',
    auto_play: String(autoPlay),
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  })
  return `https://w.soundcloud.com/player/?${params}`
}
