export type GazeSource = 'mock' | 'webcam'

export interface GazeSample {
  /** 0–1 relative to reader viewport width (left → right) */
  nx: number
  /** 0–1 relative to reader viewport height (top → bottom) */
  ny: number
  /** 0–1 heuristic confidence */
  confidence: number
  /** performance.now() or elapsed */
  timestamp: number
}
