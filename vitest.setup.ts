import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom has no media playback; stub it so audio code can run in tests.
vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
