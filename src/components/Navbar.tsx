import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-bold text-xl">
            ESP32 Rainbow
          </Link>
          <div className="flex space-x-8">
            <Link to="/" className="text-gray-300 hover:text-indigo-400">
              Home
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-indigo-400">
              FAQ
            </Link>
            <Link to="/machine" className="text-gray-300 hover:text-indigo-400">
              Machine
            </Link>
            <Link to="/firmware" className="text-gray-300 hover:text-indigo-400">
              Firmware
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 