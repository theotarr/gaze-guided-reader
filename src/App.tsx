import { Pause, Play, Settings2 } from 'lucide-react'
import { useState } from 'react'

import { CalibrationPanel } from '@/components/calibration-panel'
import { ModeToggle } from '@/components/mode-toggle'
import { ReaderViewport } from '@/components/reader-viewport'
import { SettingsSheet } from '@/components/settings-sheet'
import { Button } from '@/components/ui/button'
import { useReaderSettings } from '@/context/reader-settings'

function AppHeader() {
  const settings = useReaderSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground font-sans text-xs font-medium tracking-tight">
            gaze-guided-reader
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={settings.autoscrollPaused ? 'secondary' : 'outline'}
            size="sm"
            className="gap-1.5 font-sans"
            onClick={() =>
              settings.setAutoscrollPaused(!settings.autoscrollPaused)
            }
            aria-pressed={settings.autoscrollPaused}
          >
            {settings.autoscrollPaused ? (
              <>
                <Play className="size-3.5" />
                Resume scroll
              </>
            ) : (
              <>
                <Pause className="size-3.5" />
                Pause scroll
              </>
            )}
          </Button>
          <CalibrationPanel />
          <Button
            variant="outline"
            size="sm"
            className="gap-1 font-sans"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-3.5" />
            Settings
          </Button>
          <ModeToggle />
        </div>
      </div>
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  )
}

export default function App() {
  return (
    <div className="bg-background text-foreground font-sans flex min-h-svh flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
        <ReaderViewport />
        <p className="text-muted-foreground mt-8 max-w-2xl font-sans text-xs leading-relaxed">
          Privacy: gaze estimation runs in your browser with WebGazer. Video is
          not uploaded to a server. Face Mesh model assets load from jsDelivr by
          default (pinned version); set{" "}
          <code className="text-foreground font-mono text-[11px]">
            VITE_FACE_MESH_SOLUTION_BASE
          </code>{" "}
          to self-host files if you need an offline or locked-down build. Use HTTPS
          or localhost so the camera can start. If your system prefers reduced
          motion, auto-scroll stays off; use arrow keys, Page Up/Down, Home, and
          End inside the reader region (click it first).
        </p>
      </main>
    </div>
  )
}
