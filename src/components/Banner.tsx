import { Link } from 'react-router-dom'

export default function Banner() {
  return (
    <a
      href="https://www.crowdsupply.com/atomic14/esp32-rainbow"
      className="block bg-indigo-600 bg-opacity-95 hover:bg-indigo-500 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-medium text-white text-sm">
            Pre-order the ESP32 Rainbow ZX Spectrum Emulator on{' '}
            <span className="text-indigo-200 font-bold">
              Crowd Supply
            </span>
          </p>
        </div>
      </div>
    </a>
  )
} 