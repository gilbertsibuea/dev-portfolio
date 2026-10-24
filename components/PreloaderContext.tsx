'use client'

import { createContext, useContext } from 'react'

type PreloaderContextValue = {
  isComplete: boolean
}

const PreloaderContext = createContext<PreloaderContextValue>({
  isComplete: false,
})

export function PreloaderProvider({
  isComplete,
  children,
}: {
  isComplete: boolean
  children: React.ReactNode
}) {
  return (
    <PreloaderContext.Provider value={{ isComplete }}>
      {children}
    </PreloaderContext.Provider>
  )
}

export function usePreloader() {
  return useContext(PreloaderContext)
}
