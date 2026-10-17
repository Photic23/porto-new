import { content } from '@/content/content'
import type { Social } from '@/content/types'
import styles from './socials.module.css'

// Pixel music note with TikTok's cyan/pink offset, drawn on a 12x12 grid.
function TikTokIcon() {
  const note = (fill: string, dx: number, dy: number) => (
    <g fill={fill} transform={`translate(${dx} ${dy})`}>
      <rect x="6" y="1" width="1" height="7" />
      <rect x="7" y="1" width="1" height="1" />
      <rect x="7" y="2" width="2" height="1" />
      <rect x="9" y="3" width="1" height="1" />
      <rect x="3" y="7" width="3" height="3" />
      <rect x="4" y="6" width="2" height="1" />
    </g>
  )
  return (
    <svg viewBox="0 0 12 12" width="26" height="26" shapeRendering="crispEdges" aria-hidden="true">
      {note('#25f4ee', -1, 0)}
      {note('#fe2c55', 1, 0)}
      {note('#1a1a1a', 0, 0)}
    </svg>
  )
}

const ICONS: Record<Social['platform'], () => React.JSX.Element> = {
  tiktok: TikTokIcon,
}

export function Socials() {
  return (
    <div className={styles.socials} role="group" aria-label="social media">
      {content.socials.map((s) => {
        const Icon = ICONS[s.platform]
        return (
          <a
            key={s.platform}
            className={styles.link}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (opens in a new tab)`}
            title={s.label}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}
