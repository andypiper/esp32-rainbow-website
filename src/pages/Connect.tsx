import { useSerial } from '../contexts/SerialContext'

export default function Connect() {
  const { connected, connecting, connect, disconnect, error } = useSerial()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-100 mb-8">
          Connect to ESP32 Rainbow
        </h1>
        <p className="text-gray-300 mb-8">
          Connect to your ESP32 Rainbow device using Web Serial. Make sure your device is connected via USB.
        </p>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={connected ? disconnect : connect}
            disabled={connecting}
            className={`
              px-6 py-3 rounded-lg font-medium
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

        {connected && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Device Connected
            </h2>
            <p className="text-gray-300">
              Your ESP32 Rainbow is now connected. You can start communicating with the device.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 