// import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
// import { Z80, Memory, Port } from 'z80js'
/*
interface Z80ContextType {
  cpu: Z80 | null
  memory: Memory | null
  initialize: () => void
  step: () => void
  isInitialized: boolean
}

const Z80Context = createContext<Z80ContextType | undefined>(undefined)

export function Z80Provider({ children }: { children: ReactNode }) {
  const [cpu, setCpu] = useState<Z80 | null>(null)
  const [memory, setMemory] = useState<Memory | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const initialize = useCallback(() => {
    const mem = new Memory()
    const port = new Port()
    const newCpu = new Z80(mem, port, false) // debug mode off
    
    setCpu(newCpu)
    setMemory(mem)
    setIsInitialized(true)
  }, [])

  const step = useCallback(() => {
    if (cpu) {
      cpu.execute()
    }
  }, [cpu])

  return (
    <Z80Context.Provider 
      value={{ 
        cpu,
        memory,
        initialize,
        step,
        isInitialized
      }}
    >
      {children}
    </Z80Context.Provider>
  )
}

export function useZ80() {
  const context = useContext(Z80Context)
  if (context === undefined) {
    throw new Error('useZ80 must be used within a Z80Provider')
  }
  return context
} */