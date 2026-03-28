import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  applyWebgazerVisualPrefs,
  loadWebgazerModule,
  type WebgazerModule,
} from '@/gaze/webgazerClient'

/** Latest webcam gaze in **client** coordinates (viewport pixels); null if unknown */
export interface WebcamGazeRefState {
  clientX: number | null
  clientY: number | null
  /** 0–1 */
  confidence: number
}

const initial: WebcamGazeRefState = {
  clientX: null,
  clientY: null,
  confidence: 0,
}

function hideWebgazerDomNoise() {
  const id = 'gaze-reader-webgazer-hide'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
    #webgazerVideoContainer {
      position: fixed !important;
      left: -10000px !important;
      top: 0 !important;
      width: 4px !important;
      height: 4px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    #webgazerGazeDot { z-index: 2147483646 !important; }
  `
  document.head.appendChild(style)
}

export function useWebcamGaze(opts: {
  debugOverlay: boolean
  calibrationFactor: number
  /** While false, gaze confidence forced to 0 */
  enabled: boolean
}) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wgRef = useRef<WebgazerModule | null>(null)
  const latest = useRef<WebcamGazeRefState>({ ...initial })
  const factorRef = useRef(opts.calibrationFactor)
  const enabledRef = useRef(opts.enabled)

  useLayoutEffect(() => {
    factorRef.current = opts.calibrationFactor
    enabledRef.current = opts.enabled
  }, [opts.calibrationFactor, opts.enabled])

  const applyDebugVisuals = useCallback(
    (wg: WebgazerModule) => {
      applyWebgazerVisualPrefs(wg, { hideVisuals: !opts.debugOverlay })
      wg.params.showGazeDot = opts.debugOverlay
    },
    [opts.debugOverlay],
  )

  useEffect(() => {
    const wg = wgRef.current
    if (wg) applyDebugVisuals(wg)
  }, [applyDebugVisuals, opts.debugOverlay])

  const stop = useCallback(async () => {
    const wg = wgRef.current
    if (wg) {
      try {
        wg.clearGazeListener()
        wg.end()
      } catch {
        /* ignore */
      }
      wgRef.current = null
    }
    latest.current = { ...initial }
    setRunning(false)
  }, [])

  const start = useCallback(async () => {
    await stop()
    setError(null)
    hideWebgazerDomNoise()
    try {
      const wg = await loadWebgazerModule()
      wgRef.current = wg
      applyDebugVisuals(wg)
      wg.setGazeListener((data) => {
        const f = factorRef.current
        const on = enabledRef.current
        const conf = f >= 1 ? 0.88 : 0.25 + 0.65 * f
        if (data.x == null || data.y == null) {
          latest.current = {
            clientX: null,
            clientY: null,
            confidence: on ? conf * 0.2 : 0,
          }
          return
        }
        latest.current = {
          clientX: data.x,
          clientY: data.y,
          confidence: on ? conf : 0,
        }
      })
      await wg.begin(() => {
        setError('Camera permission is required for WebGazer.')
      })
      setRunning(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start WebGazer.')
      setRunning(false)
    }
  }, [applyDebugVisuals, stop])

  useEffect(() => {
    return () => {
      void stop()
    }
  }, [stop])

  const pauseWg = useCallback(() => {
    wgRef.current?.pause()
  }, [])

  const resumeWg = useCallback(async () => {
    await wgRef.current?.resume()
  }, [])

  return {
    latest,
    running,
    error,
    start,
    stop,
    pauseWg,
    resumeWg,
  }
}
