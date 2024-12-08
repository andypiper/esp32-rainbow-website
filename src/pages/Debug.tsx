import { useState } from 'react'
import { useSerial } from '../contexts/SerialContext'
import SpectrumScreen from '../components/SpectrumScreen'

interface Z80State {
  AF: number
  BC: number
  DE: number
  HL: number
  IX: number
  IY: number
  SP: number
  PC: number
}

const MEMORY_ROWS = 16
const BYTES_PER_ROW = 16

export default function Debug() {
  const { connected, connecting, connect, disconnect } = useSerial()
  const [command, setCommand] = useState('')
  const [memoryData] = useState<number[]>(new Array(MEMORY_ROWS * BYTES_PER_ROW).fill(0))
  const [registers] = useState<Z80State>({
    AF: 0x0000,
    BC: 0x0000,
    DE: 0x0000,
    HL: 0x0000,
    IX: 0x0000,
    IY: 0x0000,
    SP: 0x0000,
    PC: 0x0000
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send command over serial
    setCommand('')
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Machine State</h1>
        <button
          onClick={connected ? disconnect : connect}
          disabled={connecting}
          className={`
            px-4 py-2 rounded font-medium text-sm
            ${connecting ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
              connected ? 'bg-red-600 hover:bg-red-700 text-white' :
              'bg-indigo-600 hover:bg-indigo-700 text-white'}
            transition-colors duration-150
          `}
        >
          {connecting ? 'Connecting...' :
           connected ? 'Disconnect' :
           'Connect'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* First row with screen and registers */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
          <h2 className="text-gray-300 font-semibold mb-3">Screen</h2>
          <div className="flex justify-center">
            <SpectrumScreen className="border border-gray-700" />
          </div>
        </div>

        {/* Z80 Registers */}
        <div className="bg-gray-800 rounded-lg p-4 font-mono">
          <h2 className="text-gray-300 font-semibold mb-3">Z80 Registers</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(registers).map(([reg, value]) => (
              <div key={reg} className="flex justify-between items-center">
                <span className="text-gray-500">{reg}</span>
                <span className="text-gray-300">{value.toString(16).padStart(4, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Hex Dump and Command Input side by side */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 font-mono">
          <h2 className="text-gray-300 font-semibold mb-3">Memory Dump</h2>
          <div className="overflow-auto">
            {Array.from({ length: MEMORY_ROWS }, (_, row) => (
              <div key={row} className="text-sm">
                <span className="text-gray-500 mr-4">
                  {(row * BYTES_PER_ROW).toString(16).padStart(4, '0')}
                </span>
                {Array.from({ length: BYTES_PER_ROW }, (_, col) => {
                  const index = row * BYTES_PER_ROW + col
                  return (
                    <span key={col} className="text-gray-300 mr-1">
                      {memoryData[index].toString(16).padStart(2, '0')}
                    </span>
                  )
                })}
                <span className="text-gray-500 ml-4">
                  {Array.from({ length: BYTES_PER_ROW }, (_, col) => {
                    const index = row * BYTES_PER_ROW + col
                    const char = memoryData[index]
                    return char >= 32 && char <= 126 ? String.fromCharCode(char) : '.'
                  }).join('')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-gray-300 font-semibold mb-3">Command</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command..."
              className="w-full bg-gray-900 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!connected}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 