import { content } from '@/content/content'
import styles from './ui.module.css'

export function TitleOverlay({ progress }: { progress: number }) {
  const opacity = 1 - Math.min(1, progress * 3)
  return (
    <>
      <div className={styles.titleWrap}>
        <div className={styles.titleFade} style={{ opacity }}>
          <h1 className={styles.title}>hi, i&apos;m {content.name}</h1>
          <p className={styles.subtitle}>{content.tagline}</p>
        </div>
      </div>
      <div className={styles.hud}>♥♥♥ LV.22</div>
      {progress <= 0.1 && <div className={styles.prompt}>▼ scroll to look down ▼</div>}
    </>
  )
}
