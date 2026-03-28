import type { ControlSettings, ScrollControllerState } from '@/reader/controlTypes'

export interface GazeFrameInput {
  nx: number
  ny: number
  confidence: number
  dt: number
}

export interface ScrollStepResult {
  state: ScrollControllerState
  deltaX: number
  deltaY: number
  targetVx: number
  targetVy: number
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function emaAlpha(dt: number, tauSec: number) {
  if (tauSec <= 0) return 1
  return 1 - Math.exp(-dt / tauSec)
}

/**
 * Map gaze position outside soft bands to a target scroll velocity (px/s).
 * Vertical is primary; horizontal only nudges when gaze leaves a wide lane.
 */
export function computeTargetVelocity(
  state: ScrollControllerState,
  gaze: GazeFrameInput,
  settings: ControlSettings,
  viewportWidth: number,
  viewportHeight: number,
): { targetVx: number; targetVy: number; nextGaze: { nx: number; ny: number } } {
  const aG = emaAlpha(gaze.dt, settings.gazeSmoothingTauSec)
  const nx = state.gazeNx + aG * (gaze.nx - state.gazeNx)
  const ny = state.gazeNy + aG * (gaze.ny - state.gazeNy)

  const cx = 0.5
  const cy = 0.5
  const band = settings.bandHalfHeight
  const lane = settings.laneHalfWidth

  let uy = 0
  const spanY = Math.max(1e-6, 0.5 - band)
  if (ny > cy + band) uy = (ny - (cy + band)) / spanY
  else if (ny < cy - band) uy = -((cy - band) - ny) / spanY
  uy = clamp01(Math.abs(uy)) * Math.sign(uy)

  let ux = 0
  const horizontalOn =
    gaze.confidence >= settings.horizontalConfidenceThreshold
  if (horizontalOn) {
    const spanX = Math.max(1e-6, 0.5 - lane)
    if (nx > cx + lane) ux = (nx - (cx + lane)) / spanX
    else if (nx < cx - lane) ux = -((cx - lane) - nx) / spanX
    ux = clamp01(Math.abs(ux)) * Math.sign(ux)
  }

  let targetVy =
    uy *
    settings.verticalGain *
    settings.overallSensitivity *
    viewportHeight *
    0.65

  let targetVx =
    ux *
    settings.horizontalGain *
    settings.overallSensitivity *
    viewportWidth *
    0.2

  if (!horizontalOn) targetVx = 0

  const confScale =
    gaze.confidence < settings.confidenceThreshold
      ? gaze.confidence / settings.confidenceThreshold
      : 1
  targetVx *= confScale
  targetVy *= confScale

  const speed = Math.hypot(targetVx, targetVy)
  if (speed > settings.maxSpeedPxPerSec && speed > 0) {
    const s = settings.maxSpeedPxPerSec / speed
    targetVx *= s
    targetVy *= s
  }

  return {
    targetVx,
    targetVy,
    nextGaze: { nx, ny },
  }
}

/**
 * Clamp acceleration toward target velocity (jerk limit) then apply output smoothing (blend toward target).
 */
export function stepSmoothedVelocity(
  state: ScrollControllerState,
  targetVx: number,
  targetVy: number,
  dt: number,
  settings: ControlSettings,
): Pick<ScrollControllerState, 'smoothVx' | 'smoothVy'> {
  const maxDv = settings.jerkLimitPxPerSec2 * dt
  let dvx = targetVx - state.smoothVx
  let dvy = targetVy - state.smoothVy
  const mag = Math.hypot(dvx, dvy)
  if (mag > maxDv && mag > 0) {
    dvx = (dvx / mag) * maxDv
    dvy = (dvy / mag) * maxDv
  }
  let vx = state.smoothVx + dvx
  let vy = state.smoothVy + dvy

  const beta = emaAlpha(dt, settings.motionTauSec)
  vx += beta * (targetVx - vx)
  vy += beta * (targetVy - vy)

  return { smoothVx: vx, smoothVy: vy }
}

export function advanceScrollController(
  state: ScrollControllerState,
  gaze: GazeFrameInput,
  settings: ControlSettings,
  viewportWidth: number,
  viewportHeight: number,
): ScrollStepResult {
  const { targetVx, targetVy, nextGaze } = computeTargetVelocity(
    state,
    gaze,
    settings,
    viewportWidth,
    viewportHeight,
  )

  const smoothed = stepSmoothedVelocity(
    state,
    targetVx,
    targetVy,
    gaze.dt,
    settings,
  )

  const next: ScrollControllerState = {
    gazeNx: nextGaze.nx,
    gazeNy: nextGaze.ny,
    smoothVx: smoothed.smoothVx,
    smoothVy: smoothed.smoothVy,
  }

  return {
    state: next,
    deltaX: smoothed.smoothVx * gaze.dt,
    deltaY: smoothed.smoothVy * gaze.dt,
    targetVx,
    targetVy,
  }
}
