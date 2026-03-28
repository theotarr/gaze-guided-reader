import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { GazeSource } from '@/gaze/types'
import type { MockScenario } from '@/gaze/mockDriver'
import {
  defaultControlSettings,
  type ControlSettings,
} from '@/reader/controlTypes'

export interface ReaderSettingsState {
  gazeSource: GazeSource
  mockScenario: MockScenario
  controls: ControlSettings
  debugOverlay: boolean
  autoscrollPaused: boolean
  showReadingGuide: boolean
  calibrationClicksDone: number
}

const CAL_TARGET = 9

type ReaderSettingsContextValue = ReaderSettingsState & {
  setGazeSource: (s: GazeSource) => void
  setMockScenario: (s: MockScenario) => void
  setControls: (patch: Partial<ControlSettings>) => void
  resetControls: () => void
  setDebugOverlay: (v: boolean) => void
  setAutoscrollPaused: (v: boolean) => void
  setShowReadingGuide: (v: boolean) => void
  /** Webcam calibration progress 0..CAL_TARGET */
  setCalibrationClicksDone: (n: number) => void
  incrementCalibration: () => void
  calibrationTarget: number
  /** Heuristic 0–1 from calibration progress when webcam active */
  calibrationConfidenceBoost: number
}

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(
  null,
)

const initial: ReaderSettingsState = {
  gazeSource: 'mock',
  mockScenario: 'steady-down',
  controls: { ...defaultControlSettings },
  debugOverlay: false,
  autoscrollPaused: false,
  showReadingGuide: true,
  calibrationClicksDone: 0,
}

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderSettingsState>(initial)

  const setGazeSource = useCallback((gazeSource: GazeSource) => {
    setState((s) => ({ ...s, gazeSource, calibrationClicksDone: 0 }))
  }, [])

  const setMockScenario = useCallback((mockScenario: MockScenario) => {
    setState((s) => ({ ...s, mockScenario }))
  }, [])

  const setControls = useCallback((patch: Partial<ControlSettings>) => {
    setState((s) => ({
      ...s,
      controls: { ...s.controls, ...patch },
    }))
  }, [])

  const resetControls = useCallback(() => {
    setState((s) => ({ ...s, controls: { ...defaultControlSettings } }))
  }, [])

  const setDebugOverlay = useCallback((debugOverlay: boolean) => {
    setState((s) => ({ ...s, debugOverlay }))
  }, [])

  const setAutoscrollPaused = useCallback((autoscrollPaused: boolean) => {
    setState((s) => ({ ...s, autoscrollPaused }))
  }, [])

  const setShowReadingGuide = useCallback((showReadingGuide: boolean) => {
    setState((s) => ({ ...s, showReadingGuide }))
  }, [])

  const setCalibrationClicksDone = useCallback((n: number) => {
    setState((s) => ({
      ...s,
      calibrationClicksDone: Math.max(0, Math.min(CAL_TARGET, n)),
    }))
  }, [])

  const incrementCalibration = useCallback(() => {
    setState((s) => ({
      ...s,
      calibrationClicksDone: Math.min(CAL_TARGET, s.calibrationClicksDone + 1),
    }))
  }, [])

  const value = useMemo<ReaderSettingsContextValue>(() => {
    const calibrationConfidenceBoost = Math.min(
      1,
      state.calibrationClicksDone / CAL_TARGET,
    )
    return {
      ...state,
      setGazeSource,
      setMockScenario,
      setControls,
      resetControls,
      setDebugOverlay,
      setAutoscrollPaused,
      setShowReadingGuide,
      setCalibrationClicksDone,
      incrementCalibration,
      calibrationTarget: CAL_TARGET,
      calibrationConfidenceBoost,
    }
  }, [
    incrementCalibration,
    resetControls,
    setAutoscrollPaused,
    setCalibrationClicksDone,
    setControls,
    setDebugOverlay,
    setGazeSource,
    setMockScenario,
    setShowReadingGuide,
    state,
  ])

  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  )
}

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext)
  if (!ctx)
    throw new Error('useReaderSettings must be used within ReaderSettingsProvider')
  return ctx
}
