/** Pixels: allow slight tracking jitter at the reader edge without dropping the sample. */
export const READER_GAZE_EDGE_MARGIN_PX = 16

/**
 * Extra space **above** the reader top where gaze still counts for scrolling.
 * Looking up to scroll back often lands on chrome or just above the panel; without
 * this, those samples were dropped and upward scroll never engaged.
 */
export const READER_GAZE_TOP_OVERFLOW_PX = 280

/** Pixels below the reader bottom (usually smaller than top). */
export const READER_GAZE_BOTTOM_OVERFLOW_PX = READER_GAZE_EDGE_MARGIN_PX

/**
 * Pixels past `window` bounds before we treat gaze as physically off-window.
 * (WebGazer stays in viewport space; this only filters wild outliers.)
 */
export const WINDOW_GAZE_MARGIN_PX = 32

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

export type ReaderGazeScrollFrame = {
  nx: number
  ny: number
  confidence: number
  /** True when gaze is treated as aimed at the reader (counts for scrolling). */
  countsForScroll: boolean
}

/**
 * Map raw webcam gaze (viewport client coordinates) to normalized reader coordinates.
 * When the user looks outside the reader region (or far outside the window), return
 * `countsForScroll: false`, `confidence: 0`, and **hold** `heldNx`/`heldNy` so the scroll
 * controller’s gaze low-pass does not drift toward a fake clamped edge.
 */
export function mapWebcamGazeToScrollFrame(opts: {
  clientX: number
  clientY: number
  readerRect: DOMRectReadOnly
  /** Last controller `gazeNx` / `gazeNy` — reused when off-reader. */
  heldNx: number
  heldNy: number
  /** Confidence before off-reader / off-window zeroing (e.g. calibration boost). */
  baseConfidence: number
}): ReaderGazeScrollFrame {
  const {
    clientX,
    clientY,
    readerRect,
    heldNx,
    heldNy,
    baseConfidence,
  } = opts

  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    readerRect.width <= 0 ||
    readerRect.height <= 0
  ) {
    return {
      nx: heldNx,
      ny: heldNy,
      confidence: 0,
      countsForScroll: false,
    }
  }

  const nxRaw = (clientX - readerRect.left) / readerRect.width
  const nyRaw = (clientY - readerRect.top) / readerRect.height

  const marginN =
    READER_GAZE_EDGE_MARGIN_PX /
    Math.max(1, Math.min(readerRect.width, readerRect.height))

  const topMarginN =
    READER_GAZE_TOP_OVERFLOW_PX / Math.max(1, readerRect.height)
  const bottomMarginN =
    READER_GAZE_BOTTOM_OVERFLOW_PX / Math.max(1, readerRect.height)

  const inReader =
    nxRaw >= -marginN &&
    nxRaw <= 1 + marginN &&
    nyRaw >= -topMarginN &&
    nyRaw <= 1 + bottomMarginN

  const wPad = WINDOW_GAZE_MARGIN_PX
  const win =
    typeof window !== 'undefined'
      ? { w: window.innerWidth, h: window.innerHeight }
      : null
  const inWindow =
    win == null
      ? true
      : clientX >= -wPad &&
        clientX <= win.w + wPad &&
        clientY >= -wPad &&
        clientY <= win.h + wPad

  const countsForScroll = inReader && inWindow

  if (!countsForScroll) {
    return {
      nx: heldNx,
      ny: heldNy,
      confidence: 0,
      countsForScroll: false,
    }
  }

  /* Gaze above the box maps to ny=0 so “look up to go back” still drives scroll-up. */
  return {
    nx: clamp01(nxRaw),
    ny: clamp01(nyRaw),
    confidence: baseConfidence,
    countsForScroll: true,
  }
}
