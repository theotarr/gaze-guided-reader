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
            Tune gaze-driven scrolling. Try mock mode first without a camera.
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
                min={0.2}
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
                min={80}
                max={900}
                step={10}
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
              <Slider
                min={0.05}
                max={0.45}
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
              <Slider
                min={600}
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
