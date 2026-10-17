export type SectionId = 'bio' | 'education' | 'experience' | 'organization' | 'projects' | 'achievement'

export interface Entry {
  title: string
  org?: string
  date?: string
  description?: string
  link?: string
  certificate?: string
}

export interface Social {
  platform: 'tiktok'
  label: string
  url: string
}

export interface Content {
  name: string
  tagline: string
  bio: string
  education: Entry[]
  experience: Entry[]
  organization: Entry[]
  projects: Entry[]
  achievement: Entry[]
  socials: Social[]
  spotifyTrackUrl: string
}
