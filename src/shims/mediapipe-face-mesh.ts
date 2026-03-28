/**
 * @mediapipe/face_mesh is a browser IIFE that assigns `FaceMesh` to `globalThis`, not an ES module.
 * `@tensorflow-models/face-landmarks-detection` does `import * as ns from '@mediapipe/face_mesh'; new ns.FaceMesh(...)`.
 * Under Vite, that namespace was empty → runtime error: "(void 0) is not a constructor".
 */
import '@mediapipe/face_mesh/face_mesh.js'

type FaceMeshClass = typeof globalThis extends { FaceMesh: infer C } ? C : never

const FaceMeshUnknown = (globalThis as unknown as { FaceMesh?: FaceMeshClass })
  .FaceMesh

if (typeof FaceMeshUnknown !== 'function') {
  throw new Error(
    'MediaPipe FaceMesh failed to attach to globalThis after loading face_mesh.js',
  )
}

export const FaceMesh = FaceMeshUnknown
