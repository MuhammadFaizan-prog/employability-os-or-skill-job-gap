import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './style.css'

// Verification harness: capture console errors/warnings only in dev (Step 1 / IMPLEMENTATION_STEPS).
// Excluded from production to avoid bundle bloat and exposing debug globals.
declare global {
  interface Window {
    __step1ConsoleErrors?: string[]
    __step1ConsoleWarnings?: string[]
  }
}

function toMessage(a: unknown): string {
  return typeof a === 'object' && a !== null && 'message' in a
    ? String((a as Error).message)
    : String(a)
}
if (import.meta.env.DEV) {
  window.__step1ConsoleErrors = []
  window.__step1ConsoleWarnings = []
  const origError = console.error
  const origWarn = console.warn
  console.error = (...args: unknown[]) => {
    const msg = args.map(toMessage).join(' ')
    window.__step1ConsoleErrors!.push(msg)
    origError.apply(console, args as [string?, ...unknown[]])
  }
  console.warn = (...args: unknown[]) => {
    const msg = args.map(toMessage).join(' ')
    window.__step1ConsoleWarnings!.push(msg)
    origWarn.apply(console, args as [string?, ...unknown[]])
  }
  const onError = (message: string | Event, _source?: string, _lineno?: number, _colno?: number, error?: Error) => {
    const msg = error?.message ?? (typeof message === 'string' ? message : '')
    window.__step1ConsoleErrors!.push(msg)
    return false
  }
  const onUnhandledRejection = (e: PromiseRejectionEvent) => {
    window.__step1ConsoleErrors!.push(toMessage(e.reason))
  }
  window.onerror = onError
  window.addEventListener('unhandledrejection', onUnhandledRejection)
  // Cleanup on Vite HMR so listeners are not duplicated
  if (typeof import.meta.hot !== 'undefined') {
    import.meta.hot.dispose(() => {
      window.onerror = null
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    })
  }
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
