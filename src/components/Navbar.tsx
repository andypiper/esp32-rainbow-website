import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link 
            to="/" 
            className="text-indigo-400 hover:text-indigo-300 font-bold text-xl flex items-center whitespace-nowrap" 
            aria-label="ESP32 Rainbow Home"
          >
            <svg 
              className="w-6 h-6 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            ESP32 Rainbow
          </Link>
          
          {/* Hamburger menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="[&]:min-[1000px]:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="hidden min-[1000px]:flex space-x-8 items-center" role="menubar">
            <Link to="/" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" role="menuitem">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" role="menuitem">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ
            </Link>
            <Link to="/docs" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" role="menuitem">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs
            </Link>
            <Link to="/firmware" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" role="menuitem">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Firmware
            </Link>
            <Link to="/emulator" className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" role="menuitem">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Emulator
            </Link>
            <Link to="/github" className="text-gray-300 hover:text-indigo-400 flex items-center focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md" role="menuitem">
              <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Link>
            <Link 
              to="https://esp32zx.substack.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md px-3 py-2 flex items-center" 
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 4H3.5C2.67 4 2 4.67 2 5.5v13c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5zM3.5 5.5h17v2.5h-17V5.5zm0 4h17v7.5h-17V9.5z"/>
              </svg>
              Newsletter
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          id="mobile-menu"
          className={`
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
            min-[1000px]:hidden overflow-hidden
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
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ
            </Link>
            <Link 
              to="/docs" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs
            </Link>
            <Link 
              to="/firmware" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Firmware
            </Link>
            <Link 
              to="/emulator" 
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Emulator
            </Link>
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
            <Link
              to="https://esp32zx.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 4H3.5C2.67 4 2 4.67 2 5.5v13c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5zM3.5 5.5h17v2.5h-17V5.5zm0 4h17v7.5h-17V9.5z"/>
              </svg>
              Newsletter
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 