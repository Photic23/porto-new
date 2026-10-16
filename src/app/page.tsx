import { content } from '@/content/content'

export default function Home() {
  return (
    <main>
      <h1>{content.name}</h1>
      <p>{content.tagline}</p>
    </main>
  )
}
