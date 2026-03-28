import type { MockScenario } from '@/gaze/mockDriver'
import type { GazeSource } from '@/gaze/types'
import { useReaderSettings } from '@/context/reader-settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const mockScenarios: { id: MockScenario; label: string }[] = [
  { id: 'center', label: 'Center (still)' },
  { id: 'steady-down', label: 'Steady read down' },
  { id: 'steady-up', label: 'Steady read up' },
  { id: 'wander-noise', label: 'Noisy wander' },
  { id: 'regression-burst', label: 'Regression burst' },
]

export function SettingsSheet(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const settings = useReaderSettings()
  const c = settings.controls

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="font-sans w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Reader settings</SheetTitle>
          <SheetDescription>
            Defaults lean toward slower, smoother motion. Raise “motion smoothing”
            or “gaze path smoothing” for an even calmer feel; lower max speed if it
            still feels fast.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8 px-2 pb-10">
          <div className="space-y-3">
            <Label>Gaze source</Label>
            <Select
              value={settings.gazeSource}
              onValueChange={(v: GazeSource) => settings.setGazeSource(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock (tuning)</SelectItem>
                <SelectItem value="webcam">Webcam (WebGazer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.gazeSource === 'webcam' && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              <span className="text-foreground font-medium">Sharper tracking:</span>{' '}
              face the camera in even light, sit still, and redo all nine calibration
              dots while looking at each number—not the cursor. Restart the camera
              after a lighting or distance change. Higher camera resolution helps
              landmarks; we request a 960×720 ideal feed when supported.
            </p>
          )}

          {settings.gazeSource === 'mock' && (
            <div className="space-y-3">
              <Label>Mock scenario</Label>
              <Select
                value={settings.mockScenario}
                onValueChange={(v: MockScenario) =>
                  settings.setMockScenario(v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockScenarios.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="guide">Reading guide</Label>
              <Switch
                id="guide"
                checked={settings.showReadingGuide}
                onCheckedChange={settings.setShowReadingGuide}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="debug">Debug gaze overlay</Label>
              <Switch
                id="debug"
                checked={settings.debugOverlay}
                onCheckedChange={settings.setDebugOverlay}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Overall sensitivity</Label>
                <span className="text-muted-foreground">
                  {c.overallSensitivity.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0.1}
                max={2}
                step={0.05}
                value={[c.overallSensitivity]}
                onValueChange={([v]) =>
                  settings.setControls({ overallSensitivity: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Vertical gain</Label>
                <span className="text-muted-foreground">
                  {c.verticalGain.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0.3}
                max={2.2}
                step={0.05}
                value={[c.verticalGain]}
                onValueChange={([v]) => settings.setControls({ verticalGain: v })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Horizontal gain</Label>
                <span className="text-muted-foreground">
                  {c.horizontalGain.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0.05}
                max={1.2}
                step={0.05}
                value={[c.horizontalGain]}
                onValueChange={([v]) =>
                  settings.setControls({ horizontalGain: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Max speed (px/s)</Label>
                <span className="text-muted-foreground">
                  {Math.round(c.maxSpeedPxPerSec)}
                </span>
              </div>
              <Slider
                min={35}
                max={900}
                step={5}
                value={[c.maxSpeedPxPerSec]}
                onValueChange={([v]) =>
                  settings.setControls({ maxSpeedPxPerSec: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Motion smoothing (τ sec)</Label>
                <span className="text-muted-foreground">
                  {c.motionTauSec.toFixed(2)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Higher = scroll velocity eases more gently (slower apparent response).
              </p>
              <Slider
                min={0.06}
                max={0.85}
                step={0.01}
                value={[c.motionTauSec]}
                onValueChange={([v]) =>
                  settings.setControls({ motionTauSec: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Jerk limit (px/s²)</Label>
                <span className="text-muted-foreground">
                  {Math.round(c.jerkLimitPxPerSec2)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Lower = softer acceleration (less snap when speed changes).
              </p>
              <Slider
                min={400}
                max={6200}
                step={100}
                value={[c.jerkLimitPxPerSec2]}
                onValueChange={([v]) =>
                  settings.setControls({ jerkLimitPxPerSec2: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Gaze path smoothing (τ sec)</Label>
                <span className="text-muted-foreground">
                  {c.gazeSmoothingTauSec.toFixed(3)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Low-pass on gaze before the reading band. Higher = smoother, more
                lag.
              </p>
              <Slider
                min={0.02}
                max={0.22}
                step={0.005}
                value={[c.gazeSmoothingTauSec]}
                onValueChange={([v]) =>
                  settings.setControls({ gazeSmoothingTauSec: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Scroll confidence floor</Label>
                <span className="text-muted-foreground">
                  {c.confidenceThreshold.toFixed(2)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Below this, scrolling eases off (helps noisy tracking). Raise if
                motion dies too often.
              </p>
              <Slider
                min={0.12}
                max={0.58}
                step={0.01}
                value={[c.confidenceThreshold]}
                onValueChange={([v]) =>
                  settings.setControls({ confidenceThreshold: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Horizontal confidence min</Label>
                <span className="text-muted-foreground">
                  {c.horizontalConfidenceThreshold.toFixed(2)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Sideways scroll only runs above this confidence (usually keep ≥
                vertical floor).
              </p>
              <Slider
                min={0.2}
                max={0.75}
                step={0.01}
                value={[c.horizontalConfidenceThreshold]}
                onValueChange={([v]) =>
                  settings.setControls({ horizontalConfidenceThreshold: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Vertical reading band (half-height)</Label>
                <span className="text-muted-foreground">
                  {c.bandHalfHeight.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0.03}
                max={0.18}
                step={0.01}
                value={[c.bandHalfHeight]}
                onValueChange={([v]) =>
                  settings.setControls({ bandHalfHeight: v })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Horizontal lane (half-width)</Label>
                <span className="text-muted-foreground">
                  {c.laneHalfWidth.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0.12}
                max={0.4}
                step={0.01}
                value={[c.laneHalfWidth]}
                onValueChange={([v]) =>
                  settings.setControls({ laneHalfWidth: v })
                }
              />
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => settings.resetControls()}
          >
            Reset controls to defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
