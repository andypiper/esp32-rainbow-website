import { useState } from 'react'
import { useSerial } from '../contexts/SerialContext'

interface FirmwareOption {
  name: string
  version: string
  description: string
  url: string
}

const AVAILABLE_FIRMWARE: FirmwareOption[] = [
  {
    name: 'ESP32 Rainbow',
    version: '1.0.0',
    description: 'Initial release with ZX Spectrum emulation',
    url: '/firmware/esp32-rainbow-1.0.0.bin'
  },
  {
    name: 'ESP32 Rainbow',
    version: '1.0.1',
    description: 'Bug fixes and performance improvements',
    url: '/firmware/esp32-rainbow-1.0.1.bin'
  },
  // Add more firmware versions here
]

export default function Firmware() {
  const { connected, connecting, connect, disconnect } = useSerial()
  const [selectedFirmware, setSelectedFirmware] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFirmware || !connected) return

    try {
      setStatus('uploading')
      setUploadProgress(0)
      
      // TODO: Implement actual firmware upload logic here
      
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload firmware')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Firmware Update</h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-2">Connection Status</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">
              {connected ? 'Connected to device' : 'Not connected'}
            </span>
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
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Firmware Version
            </label>
            <select
              value={selectedFirmware}
              onChange={(e) => {
                setSelectedFirmware(e.target.value)
                setStatus('idle')
                setErrorMessage('')
              }}
              className="w-full bg-gray-900 text-gray-100 px-4 py-2.5 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                border border-gray-700 hover:border-gray-600
                appearance-none
                bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] 
                bg-no-repeat bg-[center_right_1rem]
                cursor-pointer"
            >
              <option value="" className="text-gray-400">Select a version...</option>
              {AVAILABLE_FIRMWARE.map((fw) => (
                <option key={fw.url} value={fw.url} className="text-gray-100 bg-gray-800">
                  {fw.name} v{fw.version}
                </option>
              ))}
            </select>
          </div>

          {selectedFirmware && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Version Details</h3>
              {AVAILABLE_FIRMWARE.find(fw => fw.url === selectedFirmware) && (
                <div className="text-sm text-gray-400">
                  <p>{AVAILABLE_FIRMWARE.find(fw => fw.url === selectedFirmware)?.description}</p>
                </div>
              )}
            </div>
          )}

          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-md p-3">
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="text-green-400 bg-green-900/30 border border-green-700 rounded-md p-3">
              Firmware updated successfully! The device will restart automatically.
            </div>
          )}

          <button
            type="submit"
            disabled={!connected || !selectedFirmware || status === 'uploading'}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed
              transition-colors duration-150"
          >
            Upload Firmware
          </button>
        </form>
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          <li>Connect your ESP32 Rainbow device via USB</li>
          <li>
            Put the device in firmware upload mode:
            <ol className="list-[a-z] pl-8 pt-2 space-y-1">
              <li>Press and hold the BOOT button</li>
              <li>Press and release the RESET button</li>
              <li>Release the BOOT button</li>
            </ol>
          </li>
          <li>Click the Connect button above</li>
          <li>Select the firmware version to install</li>
          <li>Click Upload Firmware</li>
          <li>Wait for the upload to complete</li>
          <li>Press the RESET button to start the device with the new firmware</li>
        </ol>

        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">Important Note</h3>
          <p className="text-sm text-gray-300">
            Do not disconnect the device or close this page during the firmware upload process. 
            Interrupting the upload could leave your device in an unusable state.
          </p>
        </div>
      </div>
    </div>
  )
} 