import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { ThemeProvider } from '@/components/theme-provider'
import { GazeProvider } from '@/context/gaze-context'
import { ReaderSettingsProvider } from '@/context/reader-settings'

import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ReaderSettingsProvider>
        <GazeProvider>
          <App />
        </GazeProvider>
      </ReaderSettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
