declare global {
  interface Window {
    __step1ConsoleErrors?: string[]
    __step1ConsoleWarnings?: string[]
  }
}

export {}
