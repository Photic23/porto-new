export type SectionId = 'bio' | 'education' | 'experience' | 'achievement'

export interface Entry {
  title: string
  org?: string
  date?: string
  description?: string
  link?: string
  certificate?: string
}

export interface Content {
  name: string
  tagline: string
  bio: string
  education: Entry[]
  experience: Entry[]
  achievement: Entry[]
  spotifyTrackUrl: string
}
