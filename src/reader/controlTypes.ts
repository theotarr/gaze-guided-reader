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
  /** Below this confidence, scale motion toward zero */
  confidenceThreshold: number
  /** Horizontal correction is disabled below this confidence */
  horizontalConfidenceThreshold: number
  /** First-order smoothing on normalized gaze (seconds) */
  gazeSmoothingTauSec: number
}

export const defaultControlSettings: ControlSettings = {
  overallSensitivity: 1,
  verticalGain: 1.1,
  horizontalGain: 0.35,
  maxSpeedPxPerSec: 420,
  motionTauSec: 0.14,
  jerkLimitPxPerSec2: 2800,
  bandHalfHeight: 0.07,
  laneHalfWidth: 0.22,
  confidenceThreshold: 0.35,
  horizontalConfidenceThreshold: 0.45,
  gazeSmoothingTauSec: 0.055,
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
