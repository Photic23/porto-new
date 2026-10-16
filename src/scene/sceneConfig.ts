export type Tier = 'desktop' | 'mobile'

export function tierFor(width: number): Tier {
  return width < 768 ? 'mobile' : 'desktop'
}

export function pixelSizeFor(tier: Tier): number {
  return tier === 'mobile' ? 3 : 5
}

export function sceneConfig(tier: Tier): {
  trees: number
  flowers: number
  clouds: number
  groundSegments: number
} {
  return tier === 'mobile'
    ? { trees: 30, flowers: 180, clouds: 12, groundSegments: 40 }
    : { trees: 70, flowers: 500, clouds: 22, groundSegments: 70 }
}
