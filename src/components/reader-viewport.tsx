import { useEffect, useLayoutEffect, useRef } from 'react'

import { useGazeContext } from '@/context/gaze-context'
import { useReaderSettings } from '@/context/reader-settings'
import { SAMPLE_READER_TEXT } from '@/data/sampleText'
import { mockGazeSample } from '@/gaze/mockDriver'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  advanceScrollController,
  type GazeFrameInput,
} from '@/reader/scrollController'
import {
  createInitialScrollState,
  type ScrollControllerState,
} from '@/reader/controlTypes'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function ReaderViewport() {
  const settings = useReaderSettings()
  const gazeApi = useGazeContext()
  const reducedMotion = usePrefersReducedMotion()
  const reducedMotionRef = useRef(reducedMotion)
  const scrollRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<ScrollControllerState>(createInitialScrollState())
  const mockStartRef = useRef<number | null>(null)
  const settingsRef = useRef(settings)
  const gazeApiRef = useRef(gazeApi)

  useLayoutEffect(() => {
    reducedMotionRef.current = reducedMotion
    settingsRef.current = settings
    gazeApiRef.current = gazeApi
  }, [reducedMotion, settings, gazeApi])

  useEffect(() => {
    mockStartRef.current = null
    controllerRef.current = createInitialScrollState()
  }, [settings.gazeSource, settings.mockScenario])

  useEffect(() => {
    if (settings.gazeSource === 'mock') {
      void gazeApiRef.current.stopWebcam()
    }
  }, [settings.gazeSource])

  useEffect(() => {
    const onResize = () => {
      controllerRef.current = createInitialScrollState()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onVis = () => {
      const g = gazeApiRef.current
      if (document.hidden) g.pauseWebcam()
      else void g.resumeWebcam()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const loop = (t: number) => {
      const dt = Math.min(0.055, Math.max(0.001, (t - last) / 1000))
      last = t
      const s = settingsRef.current
      const autoscrollAllowed =
        !reducedMotionRef.current &&
        !s.autoscrollPaused &&
        !document.hidden

      const el = scrollRef.current
      if (autoscrollAllowed && el) {
        const now = t
        let nx = 0.5
        let ny = 0.5
        let confidence = 0

        if (s.gazeSource === 'mock') {
          if (mockStartRef.current == null) mockStartRef.current = now
          const m = mockGazeSample(
            s.mockScenario,
            (now - mockStartRef.current) / 1000,
          )
          nx = m.nx
          ny = m.ny
          confidence = m.confidence
        } else {
          const g = gazeApiRef.current.latestRef.current
          const r = el.getBoundingClientRect()
          if (
            g.clientX != null &&
            g.clientY != null &&
            r.width > 0 &&
            r.height > 0
          ) {
            nx = clamp01((g.clientX - r.left) / r.width)
            ny = clamp01((g.clientY - r.top) / r.height)
            confidence =
              g.confidence *
              (0.55 + 0.45 * s.calibrationConfidenceBoost)
          } else {
            confidence = 0
          }
        }

        const gazeIn: GazeFrameInput = {
          nx,
          ny,
          confidence,
          dt,
        }

        const out = advanceScrollController(
          controllerRef.current,
          gazeIn,
          s.controls,
          el.clientWidth,
          el.clientHeight,
        )
        controllerRef.current = out.state

        el.scrollLeft += out.deltaX
        el.scrollTop += out.deltaY
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = scrollRef.current
    if (!el) return
    const step = 48
    const page = el.clientHeight * 0.9
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      el.scrollTop += step
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      el.scrollTop -= step
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      el.scrollTop += page
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      el.scrollTop -= page
    } else if (e.key === 'Home') {
      e.preventDefault()
      el.scrollTop = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      el.scrollTop = el.scrollHeight
    }
  }

  const s = settings
  const debug = s.debugOverlay && s.gazeSource === 'webcam'
  const gaze = gazeApi

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Reader content"
        onKeyDown={onKeyDown}
        className="bg-card text-card-foreground h-[min(78vh,720px)] overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="mx-auto w-full max-w-[42rem] px-6 py-16">
          <p className="text-muted-foreground font-sans text-xs tracking-wide uppercase">
            Gaze-guided reader
          </p>
          <h1 className="font-sans mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Reading with quieter eyes
          </h1>
          <div className="font-sans mt-10 space-y-6 text-lg leading-[1.75] md:text-[1.22rem] md:leading-[1.8]">
            {SAMPLE_READER_TEXT.split('\n\n').map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>
        </div>
      </div>

      {s.showReadingGuide && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="border-primary/20 from-primary/8 via-primary/4 h-12 w-[min(42rem,calc(100%-3rem))] rounded-md border bg-gradient-to-b to-transparent" />
        </div>
      )}

      {debug && (
        <div className="font-sans bg-background/85 text-foreground pointer-events-none absolute right-3 bottom-3 max-w-xs rounded-md border px-3 py-2 text-xs shadow-md backdrop-blur-sm">
          <div>Webcam gaze (client px, ref viewport)</div>
          <div className="text-muted-foreground mt-1 font-mono text-[11px]">
            x {gaze.latestRef.current.clientX?.toFixed(0) ?? '—'} · y{' '}
            {gaze.latestRef.current.clientY?.toFixed(0) ?? '—'}
          </div>
          <div className="text-muted-foreground font-mono text-[11px]">
            conf {(gaze.latestRef.current.confidence * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  )
}
