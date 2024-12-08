import { Link } from 'react-router-dom'
import ZXSpectrum48k from '../assets/ZXSpectrum48k.webp'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Banner Image */}
      <div className="w-full h-[300px] relative overflow-hidden">
        <img 
          src={ZXSpectrum48k} 
          alt="ZX Spectrum 48K" 
          fetchpriority="high"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-shadow-strong">
            <span className="block text-indigo-100">ESP32 Rainbow</span>
            <span className="block mt-1 text-indigo-200">ZX Spectrum Reborn</span>
          </h1>
          <p className="mt-6 text-xl text-shadow-strong text-gray-100 max-w-3xl px-4">
            A modern recreation of the Sinclair ZX Spectrum, bringing this classic 1982 computer back to life
            with cutting-edge technology and a beautiful touch keyboard.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        {/* Remove the duplicated Hero Section and start directly with the buttons */}
        <div className="text-center max-w-4xl mx-auto px-4">
          <div className="mt-10 space-x-4">
            <Link
              to="https://www.crowdsupply.com/atomic14/esp32-rainbow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-150"
            >
              Buy Now
            </Link>
            <Link
              to="/docs"
              className="inline-block px-8 py-3 text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-150"
            >
              Documentation
            </Link>
          </div>
        </div>

        {/* Video Section */}
        <div className="w-full max-w-4xl mx-auto mt-16 px-4">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-xl shadow-lg"
              src="https://www.youtube.com/embed/2moCumkF3EM"
              title="ESP32 Rainbow ZX Spectrum Demo Video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Repositories Section */}
        <div className="mt-24 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">Open Source Project</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-gray-300 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-label="GitHub Repository Icon">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-100">ESP32 ZX Spectrum</h3>
              </div>
              <p className="text-gray-300 mb-4">
                The main software repository containing the emulator firmware, desktop tools, and utilities.
                Features the complete ZX Spectrum emulator implementation for ESP32.
              </p>
              <a
                href="https://github.com/atomic14/esp32-zxspectrum"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-400 hover:text-indigo-300"
              >
                View Repository
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-gray-300 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-label="GitHub Repository Icon">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-100">ESP32 ZX Spectrum Hardware</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Complete hardware design files including KiCad PCB designs, schematics, and 3D models.
                Everything you need to build your own ESP32 Rainbow ZX Spectrum.
              </p>
              <a
                href="https://github.com/atomic14/esp32-zxspectrum-hardware"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-400 hover:text-indigo-300"
              >
                View Repository
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-24 max-w-7xl mx-auto px-4">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Support My Work</h2>
            <p className="text-gray-300 mb-6">
              If you find these projects helpful, consider supporting my work on Patreon.
              You'll get early access to content and help fund new projects!
            </p>
            <a
              href="https://www.patreon.com/c/atomic14"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-lg font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors duration-150"
            >
              <svg 
                className="w-6 h-6 mr-2" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-label="Patreon Icon"
              >
                <path d="M14.82 2.41c3.96 0 7.18 3.24 7.18 7.21 0 3.96-3.22 7.18-7.18 7.18-3.97 0-7.21-3.22-7.21-7.18 0-3.97 3.24-7.21 7.21-7.21M2 21.6h3.5V2.41H2V21.6z"/>
              </svg>
              Support on Patreon
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    title: "Classic Emulation",
    description: "Fully emulates both 48K and 128K ZX Spectrum models with authentic sound through built-in speaker or headphone jack."
  },
  {
    title: "Modern Display",
    description: "Vibrant 320 x 240 color TFT display with a beautiful 40-key full-color ZX Spectrum-style touch keyboard."
  },
  {
    title: "Powerful Hardware",
    description: "ESP32-S3 dual-core XTensa LX7 MCU running at 240 MHz for smooth emulation performance."
  },
  {
    title: "Modern Connectivity",
    description: "USB Type-C for power and data, microSD storage for games, and can even function as a USB keyboard."
  },
  {
    title: "Expandable Design",
    description: "Two QWIIC connectors and an expansion port providing access to GPIO, display, and SD card for your own projects."
  },
  {
    title: "Open Source",
    description: "Fully open hardware under GPL license, with complete KiCad project files and emulator firmware available on GitHub."
  }
]


