import { useState } from 'react'
import { useSerial } from '../contexts/SerialContext'
import { AVAILABLE_FIRMWARE, BOARD_TYPES, BoardType } from '../data/firmwareData'

export default function Firmware() {
  const { connected, connecting, connect, disconnect, isSupported } = useSerial()
  const [selectedBoard, setSelectedBoard] = useState<BoardType | ''>('')
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const availableVersions = AVAILABLE_FIRMWARE.filter(
    fw => !selectedBoard || fw.board === selectedBoard
  )

  const selectedFirmware = AVAILABLE_FIRMWARE.find(
    fw => fw.board === selectedBoard && fw.version === selectedVersion
  )

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFirmware) return

    try {
      setStatus('uploading')
      setUploadProgress(0)
      
      if (!connected) {
        try {
          await connect()
        } catch (err) {
          throw new Error('Failed to connect to device. Make sure it is in firmware upload mode.')
        }
      }
      
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

      {!isSupported && (
        <div className="mb-8 bg-red-900/30 border border-red-700 rounded-lg p-4 text-gray-100">
          <h2 className="text-sm font-semibold mb-2">Browser Not Supported</h2>
          <p className="text-sm mb-2">
            Your browser doesn't support Web Serial, which is required for firmware updates.
            Please use Chrome, Edge, or Opera to update your firmware.
          </p>
          <p className="text-xs text-gray-400">
            Firefox and Safari currently do not support Web Serial.
          </p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Board Type
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => {
                setSelectedBoard(e.target.value as BoardType)
                setSelectedVersion('')
                setStatus('idle')
                setErrorMessage('')
              }}
              className="w-full bg-gray-900 text-gray-100 px-4 py-2.5 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                border border-gray-700 hover:border-gray-600
                appearance-none
                bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] 
                bg-no-repeat bg-[center_right_1rem]
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a board...</option>
              {BOARD_TYPES.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
          </div>

          {selectedBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Firmware Version
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => {
                  setSelectedVersion(e.target.value)
                  setStatus('idle')
                  setErrorMessage('')
                }}
                className="w-full bg-gray-900 text-gray-100 px-4 py-2.5 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  border border-gray-700 hover:border-gray-600
                  appearance-none
                  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] 
                  bg-no-repeat bg-[center_right_1rem]
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a version...</option>
                {availableVersions.map((fw) => (
                  <option key={`${fw.board}-${fw.version}`} value={fw.version}>
                    v{fw.version}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedFirmware && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Version Details</h3>
              <div className="text-sm text-gray-400">
                <p>{selectedFirmware.description}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-300">Files to be flashed:</p>
                  {selectedFirmware.files.map((file, index) => (
                    <p key={index} className="pl-4">
                      • {file.path.split('/').pop()} at {file.address}
                    </p>
                  ))}
                </div>
              </div>
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
            disabled={!isSupported || !selectedFirmware || status === 'uploading'}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed
              transition-colors duration-150"
          >
            {!isSupported ? 'Browser Not Supported' : 
             status === 'uploading' ? 'Uploading...' : 
             'Upload Firmware'}
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