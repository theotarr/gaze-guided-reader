export interface ControlSettings {
  overallSensitivity: number
  verticalGain: number
  horizontalGain: number
  maxSpeedPxPerSec: number
  /** Output velocity smoothing time constant (seconds). Larger = calmer motion. */
  motionTauSec: number
  /** Maximum change in velocity magnitude per second (px/s²) */
  jerkLimitPxPerSec2: number
  /** Half-height of deadband around vertical center, as fraction of viewport (0–0.5) */
  bandHalfHeight: number
  /** Half-width of horizontal lane (no correction inside), as fraction of viewport (0–0.5) */
  laneHalfWidth: number
  /**
   * Vertical speed shaping: intent is raised to this power after mapping how far past
   * the deadband you are (1 = linear in distance; >1 = faster when looking farther).
   */
  verticalDistanceExponent: number
  /**
   * Extra vertical speed from downward/upward gaze motion (normalized y per second × viewport height).
   * 0 disables. Only applied outside the vertical deadband.
   */
  verticalGazeVelocityGain: number
  /** Below this confidence, scale motion toward zero */
  confidenceThreshold: number
  /** Horizontal correction is disabled below this confidence */
  horizontalConfidenceThreshold: number
  /** First-order smoothing on normalized gaze (seconds) */
  gazeSmoothingTauSec: number
}

/** Defaults biased toward slower, less twitchy scrolling (tune in Settings). */
export const defaultControlSettings: ControlSettings = {
  overallSensitivity: 0.78,
  verticalGain: 1,
  horizontalGain: 0.3,
  maxSpeedPxPerSec: 300,
  motionTauSec: 0.24,
  jerkLimitPxPerSec2: 1600,
  bandHalfHeight: 0.08,
  laneHalfWidth: 0.22,
  verticalDistanceExponent: 1,
  verticalGazeVelocityGain: 0,
  confidenceThreshold: 0.32,
  horizontalConfidenceThreshold: 0.45,
  gazeSmoothingTauSec: 0.1,
}

export interface ScrollControllerState {
  gazeNx: number
  gazeNy: number
  smoothVx: number
  smoothVy: number
}

export function createInitialScrollState(): ScrollControllerState {
  return {
    gazeNx: 0.5,
    gazeNy: 0.5,
    smoothVx: 0,
    smoothVy: 0,
  }
}
