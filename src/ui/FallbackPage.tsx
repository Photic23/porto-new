'use client'
import { content } from '@/content/content'
import { SECTIONS, sectionEntries } from '@/content/sections'
import { EntryList } from './SectionPage'
import { Radio } from './Radio'
import styles from './fallback.module.css'

export function FallbackPage({ radioOpen = false }: { radioOpen?: boolean }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>hi, i&apos;m kyse</h1>
        <p className={styles.subtitle}>{content.tagline}</p>
      </header>
      <div className={styles.sections}>
        {SECTIONS.map((id) => (
          <section key={id} className={styles.box} aria-label={id}>
            <h2 className={styles.heading}>{id}</h2>
            {id === 'bio' ? (
              <p className={styles.bio}>{content.bio}</p>
            ) : (
              <EntryList entries={sectionEntries(content, id)} />
            )}
          </section>
        ))}
      </div>
      <Radio key={radioOpen ? 'on' : 'off'} initialOpen={radioOpen} />
    </main>
  )
}
