/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute base URL (no trailing slash) for MediaPipe Face Mesh assets */
  readonly VITE_FACE_MESH_SOLUTION_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'webgazer' {
  const webgazer: {
    params: Record<string, unknown> & {
      faceMeshSolutionPath: string
      showVideoPreview: boolean
      showVideo: boolean
      showFaceOverlay: boolean
      showFaceFeedbackBox: boolean
      showGazeDot: boolean
      saveDataAcrossSessions: boolean
    }
    begin: (onFail?: () => void) => Promise<unknown>
    pause: () => unknown
    resume: () => Promise<unknown>
    end: () => unknown
    setGazeListener: (
      fn: (
        data: { x: number | null; y: number | null } | null,
        elapsed: number,
      ) => void,
    ) => unknown
    clearGazeListener: () => unknown
    isReady: () => boolean
    showVideoPreview: (v: boolean) => unknown
  }
  export default webgazer
}
