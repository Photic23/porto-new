import type { Content } from './types'

// Content adapted from https://photic23.vercel.app/ (newest first in each list).
export const content: Content = {
  name: 'kyse',
  tagline: "i write software & make little things",
  bio:
    "An Information Systems Graduate from Universitas Indonesia, currently a fulltime software engineer and lecturer's project assistant. " +
    'Motivated to create positive impact, learn and explore new experiences, earn new abilities, ' +
    'improve my capabilities and broaden my knowledge. I also love solo travelling and manga/novel reading.',
  education: [
    {
      title: 'Bachelor of Information Systems',
      org: 'Universitas Indonesia',
      date: '2022 - 2026',
      description: 'Specialized in software development.',
    },
    {
      title: 'Fast Offer International Japanese Language Program',
      org: 'Pusat Studi Jepang UI',
      date: '2024 - 2025',
      description: 'Studied japanese equivalent to N5 level.',
    },
  ],
  experience: [
    // formal
    {
      title: 'Project Assistant',
      org: 'Faculty of Computer Science, Universitas Indonesia',
      date: 'Nov 2026 - present',
      description: "Assisted in the productionization of a lecturer's project.",
    },
    {
      title: 'Software Engineer',
      org: 'Sokratech',
      date: 'Dec 2025 - present',
      description: 'Working on the Fraud Detection System.',
    },
    {
      title: 'Software Engineer Intern',
      org: 'Sokratech',
      date: 'Jun 2025 - Dec 2025',
      description: 'Worked on Fraud Detection System and KYC prototype.',
    },
    {
      title: 'Frontend Developer Intern',
      org: 'Avatar Solution',
      date: 'May 2025 - present',
      description: 'Building the frontend side of websites for clients. HTML/CSS, Next.js, React, Tailwind CSS, TypeScript.',
    },
    {
      title: 'Teaching Assistant, Security Driven Software Development',
      org: 'Faculty of Computer Science, Universitas Indonesia',
      date: 'Jan 2025 - present',
      description:
        'Scored assignments, answered questions about the lectures and assignments, and helped students with their assignments.',
    },
    // organizational
    {
      title: 'Team Member of Talent Intelligence',
      org: 'AIESEC Universitas Indonesia',
      date: 'Feb 2023 - Feb 2024',
      description:
        "Analyzed members' performance through both quantitative and qualitative measurements. Held quarterly performance meetings with 4 departments.",
    },
    {
      title: 'People Operations of Network, Security, and OS',
      org: 'RISTEK Fasilkom UI',
      date: 'Feb 2022 - Jul 2023',
      description: 'Assisted the operational processes of the Network, Security, and OS SIG of RISTEK Fasilkom UI.',
    },
    // projects
    {
      title: 'Invotrax: backend, frontend & DevOps',
      org: 'Inventory management app for PT Karya Bersama Pinto',
      date: 'Feb 2025 - present',
      description:
        'Backend in Django with PostgreSQL, frontend in Next.js and Tailwind CSS, and the deployment setup: Tencent VPS for the backend, Vercel for the frontend, CI/CD scripts for automation.',
      link: 'https://gitlab.cs.ui.ac.id/propensi-2024-2025-genap/kelas-a/a06-propenchill-fe',
    },
    {
      title: 'RSISDM',
      org: 'SISDM course project',
      date: 'Oct 2024 - Dec 2024',
      description:
        'Set up Odoo 16 for a hospital scenario: imported the necessary packages, built a custom PPH21 package, and deployed it on an Azure VPS.',
    },
    {
      title: 'OKK UI 2024 website',
      org: 'OKK UI 2024',
      date: 'Jun 2024 - Aug 2024',
      description: 'Developed the frontend of the OKK UI 2024 website with React, Next.js and Tailwind CSS.',
      link: 'https://github.com/okk-ui-2024',
    },
    {
      title: 'Personal portfolio website',
      org: 'Personal project',
      date: 'Apr 2024 - present',
      description: 'Designed and developed a responsive portfolio website with React and Tailwind CSS.',
      link: 'https://github.com/Photic23/FE-Porto',
    },
  ],
  achievement: [
    {
      title: 'National Cyber Week CTF 2024 Finalist',
      org: 'BINUS University',
      date: 'Oct 2024',
      description: 'Solved cybersecurity challenges and submitted the write-up.',
    },
    {
      title: '2nd Place, Code in the Dark',
      org: 'RISTEK Fasilkom UI',
      date: 'Nov 2023',
      description: 'Built the frontend of a website within an hour without being allowed to look at the preview.',
    },
    {
      title: 'Best Member of People Operations, Q1',
      org: 'RISTEK Fasilkom UI',
      date: 'Jun 2023',
      description:
        "Assisted the Network, Security, and OS SIG of RISTEK Fasilkom UI with its operations and helped with RISTEK's internal events.",
    },
    {
      title: 'AIESEC UI Best Member of February 2023',
      org: 'AIESEC Universitas Indonesia',
      date: 'Feb 2023',
      description: 'Improved the existing performance measurement system in Excel for better efficiency and accuracy.',
    },
  ],
  spotifyTrackUrl: 'https://open.spotify.com/album/6fZfS2mCLxlXt4MVSedvXj',
}
