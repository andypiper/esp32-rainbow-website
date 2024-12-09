import { createContext, useContext, ReactNode } from 'react'

interface SerialContextType {
  isSupported: boolean;
}

const SerialContext = createContext<SerialContextType | undefined>(undefined)

export function SerialProvider({ children }: { children: ReactNode }) {
  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  return (
    <SerialContext.Provider 
      value={{ 
        isSupported,
      }}
    >
      {children}
    </SerialContext.Provider>
  )
}

export function useSerial() {
  const context = useContext(SerialContext)
  if (context === undefined) {
    throw new Error('useSerial must be used within a SerialProvider')
  }
  return context
} 