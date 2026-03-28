import { describe, expect, it } from 'vitest'

import {
  createInitialScrollState,
  defaultControlSettings,
} from '@/reader/controlTypes'
import { advanceScrollController } from '@/reader/scrollController'

describe('scrollController', () => {
  it('does not exceed max speed under sustained gaze down', () => {
    let state = createInitialScrollState()
    const settings = {
      ...defaultControlSettings,
      maxSpeedPxPerSec: 200,
      motionTauSec: 0.2,
    }
    const w = 400
    const h = 600
    for (let i = 0; i < 120; i++) {
      const out = advanceScrollController(
        state,
        { nx: 0.5, ny: 0.95, confidence: 1, dt: 1 / 60 },
        settings,
        w,
        h,
      )
      state = out.state
      const vv = Math.hypot(state.smoothVx, state.smoothVy)
      expect(vv).toBeLessThanOrEqual(settings.maxSpeedPxPerSec * 1.02)
    }
  })

  it('zeros horizontal intent when confidence is below horizontal threshold', () => {
    const state = createInitialScrollState()
    const settings = { ...defaultControlSettings, horizontalConfidenceThreshold: 0.6 }
    const out = advanceScrollController(
      state,
      { nx: 0.95, ny: 0.5, confidence: 0.4, dt: 1 / 60 },
      settings,
      500,
      500,
    )
    expect(Math.abs(out.targetVx)).toBeLessThan(1e-6)
  })
})
