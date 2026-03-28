export type WebgazerModule = typeof import('webgazer').default

export interface WebgazerClientOptions {
  /** Hide in-page preview feed; tracking still uses the video element internally */
  hideVisuals: boolean
}

/**
 * WebGazer defaults to `./mediapipe/face_mesh` (see `webgazer/src/params.mjs`).
 * That path is resolved against the **page origin**, so on Vite it becomes
 * `/mediapipe/face_mesh/*` → 404, MediaPipe WASM never loads, and minified code
 * can throw e.g. `z is not a function`.
 *
 * Pin the npm version so URLs stay stable. Override with
 * `VITE_FACE_MESH_SOLUTION_BASE` for self-hosting under `public/`.
 */
const FACE_MESH_PKG_VERSION = '0.4.1633559619'
const DEFAULT_FACE_MESH_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${FACE_MESH_PKG_VERSION}`

let cached: WebgazerModule | null = null

/** Same `params` object WebGazer’s face mesh reads at detector init time. */
export function applyMediaPipeFaceMeshSolutionPath(wg: WebgazerModule) {
  const base =
    import.meta.env.VITE_FACE_MESH_SOLUTION_BASE || DEFAULT_FACE_MESH_BASE
  wg.params.faceMeshSolutionPath = String(base).replace(/\/+$/, '')
}

export async function loadWebgazerModule(): Promise<WebgazerModule> {
  if (cached) {
    applyMediaPipeFaceMeshSolutionPath(cached)
    return cached
  }
  const mod = await import('webgazer')
  cached = mod.default
  applyMediaPipeFaceMeshSolutionPath(cached)
  return cached
}

export function applyWebgazerVisualPrefs(
  wg: WebgazerModule,
  opts: WebgazerClientOptions,
) {
  applyMediaPipeFaceMeshSolutionPath(wg)
  wg.params.showVideoPreview = !opts.hideVisuals
  wg.params.showVideo = true
  wg.params.showFaceOverlay = opts.hideVisuals ? false : true
  wg.params.showFaceFeedbackBox = false
  wg.params.showGazeDot = !opts.hideVisuals
  wg.params.saveDataAcrossSessions = false
  /* Kalman on ridge output reduces jitter (see webgazer `applyKalmanFilter`). */
  wg.applyKalmanFilter(true)
  const prev = wg.params.camConstraints as {
    video: Record<string, unknown>
  }
  wg.params.camConstraints = {
    video: {
      ...prev.video,
      facingMode: 'user',
      width: { min: 320, ideal: 960, max: 1920 },
      height: { min: 240, ideal: 720, max: 1080 },
    },
  }
}

export type GazeListener = (
  data: { x: number | null; y: number | null } | null,
  elapsed: number,
) => void
