import { useCallback } from 'react'

import { useWebcamGaze } from '@/gaze/useWebcamGaze'

export interface UseGazeOptions {
  debugOverlay: boolean
  calibrationClicksDone: number
  calibrationTarget: number
  gazeSource: 'mock' | 'webcam'
}

/**
 * Webcam pipeline for gaze-guided scrolling.
 * When `gazeSource` is `mock`, consumers should generate samples via `mockGazeSample` instead.
 *
 * `latestRef` holds the last sample in **client/viewport pixel** coordinates (WebGazer convention).
 */
export function useGaze(options: UseGazeOptions) {
  const factor =
    options.calibrationTarget > 0
      ? options.calibrationClicksDone / options.calibrationTarget
      : 0

  const enabled = options.gazeSource === 'webcam'

  const webcam = useWebcamGaze({
    debugOverlay: options.debugOverlay,
    calibrationFactor: factor,
    enabled,
  })

  const startWebcam = useCallback(async () => {
    await webcam.start()
  }, [webcam])

  const stopWebcam = useCallback(async () => {
    await webcam.stop()
  }, [webcam])

  return {
    /** Latest webcam gaze; clientX/Y null when unknown */
    latestRef: webcam.latest,
    running: webcam.running,
    error: webcam.error,
    calibrated:
      options.gazeSource === 'webcam' &&
      options.calibrationClicksDone >= options.calibrationTarget,
    startWebcam,
    stopWebcam,
    pauseWebcam: webcam.pauseWg,
    resumeWebcam: webcam.resumeWg,
  }
}
