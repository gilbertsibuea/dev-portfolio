'use client'

import { useState } from 'react'
import Preloader from './Preloader'
import { PreloaderProvider } from './PreloaderContext'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)

  return (
    <PreloaderProvider isComplete={isPreloaderComplete}>
      {children}
      {isPreloaderVisible && (
        <Preloader
          onLoadComplete={() => {
            setIsPreloaderComplete(true)
            setIsPreloaderVisible(false)
          }}
        />
      )}
    </PreloaderProvider>
  )
}
