import { Link } from 'react-router-dom'
import { useSerial } from '../contexts/SerialContext'

export default function Navbar() {
  const { connected } = useSerial()

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
            <Link 
              to="/connect" 
              className={`flex items-center space-x-2 ${
                connected ? 'text-green-400 hover:text-green-300' : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              <span>Connect</span>
              {connected && (
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 