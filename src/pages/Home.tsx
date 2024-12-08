import { Link } from 'react-router-dom'
import ZXSpectrum48k from '../assets/ZXSpectrum48k.jpg'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Banner Image */}
      <div className="w-full h-[300px] relative overflow-hidden">
        <img 
          src={ZXSpectrum48k} 
          alt="ZX Spectrum 48K" 
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
              to="/buy"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-150"
            >
              Pre-order Now
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
              title="ESP32 Rainbow ZX Spectrum Demo"
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


