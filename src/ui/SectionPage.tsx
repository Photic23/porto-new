'use client'
import { useEffect } from 'react'
import { content } from '@/content/content'
import { sectionEntries } from '@/content/sections'
import type { Entry, SectionId } from '@/content/types'
import styles from './ui.module.css'

export function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return <p className={styles.empty}>nothing here yet ✿</p>
  return (
    <ul className={styles.entryList}>
      {entries.map((e, i) => (
        <li key={i} className={styles.entry}>
          <h3 className={styles.entryTitle}>{e.title}</h3>
          {(e.org || e.date) && (
            <div className={styles.entryMeta}>{[e.org, e.date].filter(Boolean).join(' · ')}</div>
          )}
          {e.description && <div>{e.description}</div>}
          {e.link && (
            <div>
              <a href={e.link} target="_blank" rel="noopener noreferrer">link</a>
            </div>
          )}
          {e.certificate && (
            <div>
              <a href={e.certificate} target="_blank" rel="noopener noreferrer">certificate</a>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function SectionPage({ id, onClose }: { id: SectionId; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <section className={styles.page} aria-label={id}>
      <button type="button" className={styles.back} onClick={onClose}>◀ back</button>
      <h2 className={styles.heading}>{id}</h2>
      {id === 'bio' ? (
        <p className={styles.empty}>{content.bio}</p>
      ) : (
        <EntryList entries={sectionEntries(content, id)} />
      )}
    </section>
  )
}
