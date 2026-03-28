import type { GazeSample } from '@/gaze/types'

export type MockScenario =
  | 'center'
  | 'steady-down'
  | 'steady-up'
  | 'wander-noise'
  | 'regression-burst'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Deterministic mock gaze for tuning the scroll controller without a webcam.
 * `elapsedSec` should be wall-clock elapsed from scenario start.
 */
export function mockGazeSample(
  scenario: MockScenario,
  elapsedSec: number,
): GazeSample {
  const t = elapsedSec
  switch (scenario) {
    case 'center':
      return {
        nx: 0.5,
        ny: 0.5,
        confidence: 1,
        timestamp: performance.now(),
      }
    case 'steady-down': {
      const ny = clamp01(0.52 + t * 0.035)
      return {
        nx: 0.5 + Math.sin(t * 1.1) * 0.04,
        ny,
        confidence: 0.95,
        timestamp: performance.now(),
      }
    }
    case 'steady-up': {
      const ny = clamp01(0.48 - t * 0.03)
      return {
        nx: 0.52,
        ny,
        confidence: 0.92,
        timestamp: performance.now(),
      }
    }
    case 'wander-noise':
      return {
        nx: clamp01(0.5 + Math.sin(t * 2.7) * 0.2 + (Math.sin(t * 11.3) * 0.02)),
        ny: clamp01(0.5 + Math.cos(t * 1.9) * 0.12 + t * 0.015),
        confidence: 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.6)),
        timestamp: performance.now(),
      }
    case 'regression-burst': {
      // Drift down, then snap gaze upward for a moment (reread)
      const phase = t % 14
      let ny = 0.55 + phase * 0.02
      let nx = 0.48
      let conf = 0.9
      if (phase > 4 && phase < 5.5) {
        ny = 0.38
        nx = 0.42
        conf = 0.75
      }
      return {
        nx: clamp01(nx),
        ny: clamp01(ny),
        confidence: conf,
        timestamp: performance.now(),
      }
    }
    default:
      return mockGazeSample('center', 0)
  }
}
