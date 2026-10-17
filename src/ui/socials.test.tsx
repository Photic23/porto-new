import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Socials } from './Socials'
import { content } from '@/content/content'

describe('Socials', () => {
  it('renders one new-tab link per social account', () => {
    render(<Socials />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(content.socials.length)
    content.socials.forEach((s, i) => {
      expect(links[i]).toHaveAttribute('href', s.url)
      expect(links[i]).toHaveAttribute('target', '_blank')
      expect(links[i]).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
  it('has a TikTok link with an accessible name', () => {
    render(<Socials />)
    const tiktok = screen.getByRole('link', { name: /tiktok/i })
    expect(tiktok.getAttribute('href')).toMatch(/^https:\/\/www\.tiktok\.com\/@/)
  })
})
