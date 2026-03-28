import { describe, expect, it } from 'vitest'

import {
  createInitialScrollState,
  defaultControlSettings,
} from '@/reader/controlTypes'
import {
  advanceScrollController,
  computeTargetVelocity,
} from '@/reader/scrollController'

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

  it('with γ>1, boosts scroll more for far-down gaze than for just-past-band gaze (vs γ=1)', () => {
    const state = createInitialScrollState()
    const snap = { ...defaultControlSettings, gazeSmoothingTauSec: 0.001 }
    const linear = { ...snap, verticalDistanceExponent: 1 }
    const curved = { ...snap, verticalDistanceExponent: 2 }
    const gazeNear = { nx: 0.5, ny: 0.62, confidence: 1, dt: 1 / 60 }
    const gazeFar = { nx: 0.5, ny: 0.95, confidence: 1, dt: 1 / 60 }
    const nL = computeTargetVelocity(state, gazeNear, linear, 400, 600)
    const fL = computeTargetVelocity(state, gazeFar, linear, 400, 600)
    const nC = computeTargetVelocity(state, gazeNear, curved, 400, 600)
    const fC = computeTargetVelocity(state, gazeFar, curved, 400, 600)
    const ratioLin = fL.targetVy / Math.max(1e-6, nL.targetVy)
    const ratioCurved = fC.targetVy / Math.max(1e-6, nC.targetVy)
    expect(ratioCurved).toBeGreaterThan(ratioLin)
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
