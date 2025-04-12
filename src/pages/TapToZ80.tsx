import { Helmet } from 'react-helmet-async'
import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Z80FileVersion, 
  loadWasmModule, 
  convertTapToZ80, 
  cleanupZ80Resources 
} from '../utils/tapToZ80Converter'

export default function TapToZ80() {
  const [z80Files, setZ80Files] = useState<{
    spectrum48k: Z80FileVersion | null;
    spectrum128k: Z80FileVersion | null;
  }>({
    spectrum48k: null,
    spectrum128k: null
  })
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wasmModule, setWasmModule] = useState<{
    convertTapeToZ80: (filename: string, data: Uint8Array, is128k: boolean) => Uint8Array
  } | null>(null)
  const [originalFilename, setOriginalFilename] = useState<string>('')

  // Initialize WASM module
  useEffect(() => {
    const initWasm = async () => {
      try {
        const module = await loadWasmModule()
        setWasmModule(module)
      } catch (err) {
        setError('Failed to initialize converter')
        console.error('WASM init error:', err)
      }
    }

    initWasm()

    // Cleanup
    return () => {
      const script = document.getElementById('tap-to-z80-wasm')
      if (script) {
        script.remove()
      }
    }
  }, [])

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupZ80Resources(z80Files)
    }
  }, [z80Files])

  const handleFile = useCallback(async (file: File) => {
    try {
      setError('')
      setIsProcessing(true)
      
      // Reset previous conversion results
      cleanupZ80Resources(z80Files)
      setZ80Files({
        spectrum48k: null,
        spectrum128k: null
      })

      const result = await convertTapToZ80(file, wasmModule)
      setZ80Files({
        spectrum48k: result.spectrum48k,
        spectrum128k: result.spectrum128k
      })
      setOriginalFilename(result.originalFilename)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }, [wasmModule, z80Files])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>ZX Spectrum TAP/TZX to Z80 Converter</title>
        <meta name="description" content="Convert ZX Spectrum TAP and TZX files to Z80 snapshot format" />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">TAP/TZX to Z80 Converter</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="mb-4">Convert your ZX Spectrum TAP and TZX files to Z80 snapshot format.</p>
        
        <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg 
              className="w-6 h-6 text-indigo-400 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-indigo-200">
                Looking for ZX Spectrum games in TAP/TZX format? Check out our{' '}
                <Link 
                  to="/games" 
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  games catalog
                </Link>
                , where you can find and download thousands of classic Spectrum games ready for conversion.
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}
            ${error ? 'border-red-500' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="mb-4">
            <label className="cursor-pointer">
              <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Select TAP/TZX File
              </span>
              <input
                type="file"
                accept=".tap,.tzx,.zip"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
          
          <p className="text-gray-400 mt-4">or drag and drop your TAP/TZX file here</p>
          
          <div className="text-left text-xs text-gray-400 mt-4 bg-gray-700/50 p-2 rounded">
            <p><strong className="text-indigo-400">About Z80 Spectrum Versions</strong></p>
            <p className="mt-1">This tool will automatically create both 48K and 128K versions of your Z80 snapshot file, so you can choose the one that works best for your program.</p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="text-blue-400 mb-4">
            Processing file...
          </div>
        )}

        {(z80Files.spectrum48k || z80Files.spectrum128k) && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">
              Converted: {originalFilename}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* 48K Version */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex flex-col h-full">
                  <h4 className="text-md font-semibold text-blue-400">ZX Spectrum 48K Version</h4>
                  <p className="text-gray-400 text-sm mt-2 mb-4 flex-grow">
                    Best for most classic games and programs designed for the original 48K Spectrum.
                  </p>
                  <a
                    href={z80Files.spectrum48k?.url}
                    download={z80Files.spectrum48k?.filename}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center w-full"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download 48K Z80
                  </a>
                </div>
              </div>
              
              {/* 128K Version */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex flex-col h-full">
                  <h4 className="text-md font-semibold text-blue-400">ZX Spectrum 128K Version</h4>
                  <p className="text-gray-400 text-sm mt-2 mb-4 flex-grow">
                    Best for later games that use enhanced audio, graphics or extra memory of the 128K Spectrum.
                  </p>
                  <a
                    href={z80Files.spectrum128k?.url}
                    download={z80Files.spectrum128k?.filename}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center w-full"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download 128K Z80
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-indigo-400 mb-2">Which version should I choose?</h4>
              <ul className="list-disc pl-4 text-sm space-y-1 text-gray-300">
                <li><strong>Choose 128K</strong> if the game's title mentions "128K" or was released after 1986</li>
                <li><strong>Choose 48K</strong> for most games released before 1986 or if unsure</li>
                <li>The 128K version may work for 48K programs, but not always perfectly</li>
                <li>Try both versions if one doesn't work as expected</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">About Z80 Snapshot Files</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Z80 snapshot files are memory dumps of the ZX Spectrum's state at a specific moment in time.
            Unlike TAP and TZX files which need to be loaded in real-time, Z80 snapshots instantly restore
            the computer to a saved state - perfect for quick loading of games and programs.
          </p>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Z80 Format Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Instant Loading</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>No wait times or loading screens</li>
                  <li>Start playing immediately</li>
                  <li>Perfect for emulators</li>
                  <li>Preserves exact game state</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Compatibility</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Widely supported format</li>
                  <li>Works with most emulators</li>
                  <li>Contains RAM and register data</li>
                  <li>Supports 48K and 128K models</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">References</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://worldofspectrum.org/faq/reference/z80format.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">Z80 Format Specification</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Detailed technical specification of the Z80 snapshot format, including descriptions of 
                    header structures, compression methods, and version differences.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://sinclair.wiki.zxnet.co.uk/wiki/Z80_format"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">Z80 Format Wiki</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Community-maintained documentation of the Z80 snapshot format with explanations of how 
                    memory banks, registers, and hardware states are saved.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.spectaculator.com/docs/zx-state/z80-state.shtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">Spectaculator Z80 Documentation</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Detailed description of the Z80 snapshot format as implemented in the Spectaculator 
                    emulator, with information on backwards compatibility.
                  </p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 