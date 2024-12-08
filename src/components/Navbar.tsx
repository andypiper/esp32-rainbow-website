import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-bold text-xl" aria-label="ESP32 Rainbow Home">
            ESP32 Rainbow
          </Link>
          
          {/* Hamburger menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200 ease-in-out"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                className={`transform origin-center transition-transform duration-200 ease-in-out ${
                  isOpen ? 'scale-0' : 'scale-100'
                }`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                className={`transform origin-center transition-transform duration-200 ease-in-out ${
                  isOpen ? 'scale-100' : 'scale-0'
                }`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8 items-center" role="menubar">
            <Link to="/" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2" role="menuitem">
              Home
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2" role="menuitem">
              FAQ
            </Link>
            <Link to="/docs" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2" role="menuitem">
              Docs
            </Link>
            <span className="text-gray-600 cursor-not-allowed flex items-center px-2 py-1" title="Coming Soon" role="menuitem">
              Machine
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-gray-600 cursor-not-allowed flex items-center px-2 py-1" title="Coming Soon" role="menuitem">
              Firmware
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <Link to="/github" className="text-gray-300 hover:text-indigo-400 flex items-center focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md" role="menuitem">
              <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          id="mobile-menu"
          className={`
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
            md:hidden overflow-hidden
          `}
          style={{
            maxHeight: isOpen ? '400px' : '0px',
            transition: 'max-height 300ms ease-in-out, opacity 200ms ease-in-out, transform 200ms ease-in-out'
          }}
          role="menu"
          aria-label="Mobile navigation"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Home
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              FAQ
            </Link>
            <Link 
              to="/docs" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Docs
            </Link>
            <span className="text-gray-600 cursor-not-allowed flex items-center px-3 py-2" title="Coming Soon" role="menuitem">
              Machine
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-gray-600 cursor-not-allowed flex items-center px-3 py-2" title="Coming Soon" role="menuitem">
              Firmware
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            <Link
              to="/github"
              className="text-gray-300 hover:text-indigo-400 flex items-center px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 