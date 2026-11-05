'use client'

import { useState } from 'react'
import { BackToTop } from './BackToTop'
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
      <BackToTop />
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
