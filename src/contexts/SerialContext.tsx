import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SerialContextType {
  port: SerialPort | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  isSupported: boolean
}

const SerialContext = createContext<SerialContextType | undefined>(undefined)

export function SerialProvider({ children }: { children: ReactNode }) {
  const [port, setPort] = useState<SerialPort | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  const connect = useCallback(async () => {
    try {
      setConnecting(true)

      // Request port and open it
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 115200 })

      setPort(port)
      setConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close()
        setPort(null)
        setConnected(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disconnect')
      }
    }
  }, [port])

  return (
    <SerialContext.Provider 
      value={{ 
        port, 
        connected, 
        connecting, 
        connect, 
        disconnect, 
        isSupported 
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