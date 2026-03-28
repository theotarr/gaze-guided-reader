import { createContext, useContext, type ReactNode } from 'react'

import { useReaderSettings } from '@/context/reader-settings'
import { useGaze } from '@/gaze/useGaze'

type GazeContextValue = ReturnType<typeof useGaze>

const GazeContext = createContext<GazeContextValue | null>(null)

export function GazeProvider({ children }: { children: ReactNode }) {
  const settings = useReaderSettings()
  const gaze = useGaze({
    debugOverlay: settings.debugOverlay,
    calibrationClicksDone: settings.calibrationClicksDone,
    calibrationTarget: settings.calibrationTarget,
    gazeSource: settings.gazeSource,
  })

  return <GazeContext.Provider value={gaze}>{children}</GazeContext.Provider>
}

export function useGazeContext() {
  const ctx = useContext(GazeContext)
  if (!ctx) throw new Error('useGazeContext needs GazeProvider')
  return ctx
}
