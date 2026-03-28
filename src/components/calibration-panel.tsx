import { useState } from 'react'

import { useGazeContext } from '@/context/gaze-context'
import { useReaderSettings } from '@/context/reader-settings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const points = [
  { x: 12, y: 12 },
  { x: 50, y: 12 },
  { x: 88, y: 12 },
  { x: 12, y: 50 },
  { x: 50, y: 50 },
  { x: 88, y: 50 },
  { x: 12, y: 88 },
  { x: 50, y: 88 },
  { x: 88, y: 88 },
]

export function CalibrationPanel() {
  const [open, setOpen] = useState(false)
  const [consent, setConsent] = useState(false)
  const settings = useReaderSettings()
  const gaze = useGazeContext()

  const startCalibration = async () => {
    if (!consent) return
    settings.setGazeSource('webcam')
    settings.setCalibrationClicksDone(0)
    await gaze.startWebcam()
  }

  const handleDotClick = (index: number) => {
    if (index === settings.calibrationClicksDone) {
      settings.incrementCalibration()
    }
  }

  const handleClose = async () => {
    setOpen(false)
    setConsent(false)
  }

  const handleStopCamera = async () => {
    await gaze.stopWebcam()
    settings.setCalibrationClicksDone(0)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Calibrate camera
      </Button>
      <Dialog open={open} onOpenChange={(v) => !v && void handleClose()}>
        <DialogContent className="max-w-lg font-sans sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Webcam calibration</DialogTitle>
            <DialogDescription className="text-pretty">
              Gaze-guided scrolling uses WebGazer in your browser. Video stays
              on-device and is not uploaded. Allow camera access when prompted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="border-input mt-1 size-4 rounded"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I understand the camera runs locally only for gaze estimation
                (no video upload).
              </span>
            </label>

            <Separator />

            <div className="space-y-2">
              <Label>Calibration targets</Label>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Look at each dot and click it once. {settings.calibrationClicksDone}/
                {settings.calibrationTarget} completed. Click events train
                WebGazer’s regressors.
              </p>
              <div
                className="border-border bg-muted/40 relative mx-auto aspect-[4/3] w-full max-w-md rounded-lg border"
                style={{ touchAction: 'manipulation' }}
              >
                {points.map((p, i) => {
                  const done = i < settings.calibrationClicksDone
                  const isNext = i === settings.calibrationClicksDone
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!isNext}
                      className={`absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-xs font-medium transition-colors disabled:opacity-40 ${
                        done
                          ? 'border-primary bg-primary/20 text-primary'
                          : isNext
                            ? 'border-primary ring-ring bg-background ring-2'
                            : 'bg-background border-input'
                      }`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      onClick={() => handleDotClick(i)}
                      aria-label={`Calibration point ${i + 1}${isNext ? ' (current)' : ''}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {gaze.error && (
              <p className="text-destructive text-sm">{gaze.error}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleStopCamera()}
            >
              Stop camera
            </Button>
            <Button
              type="button"
              onClick={() => void startCalibration()}
              disabled={!consent}
            >
              {gaze.running ? 'Restart camera' : 'Start camera'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
