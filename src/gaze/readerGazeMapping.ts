/** Pixels: allow slight tracking jitter at the reader edge without dropping the sample. */
export const READER_GAZE_EDGE_MARGIN_PX = 16

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

  const inReader =
    nxRaw >= -marginN &&
    nxRaw <= 1 + marginN &&
    nyRaw >= -marginN &&
    nyRaw <= 1 + marginN

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

  return {
    nx: clamp01(nxRaw),
    ny: clamp01(nyRaw),
    confidence: baseConfidence,
    countsForScroll: true,
  }
}
