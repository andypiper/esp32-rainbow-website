import { Helmet } from 'react-helmet-async'
import { useState, useCallback, useEffect, useRef } from 'react'
import WaveformVisualizer from '../components/WaveformVisualizer'
import { Link } from 'react-router-dom'
import { findTapeFile, type ArchiveFile } from '../utils/archiveHelpers'

// Declare the type for our WASM module
declare const createTapeModule: () => Promise<{
  convertTapeFile(inputArray: Uint8Array, isTap: boolean): Uint8Array;
}>

const WASM_SCRIPT_ID = 'tap-to-wav-wasm'
const WASM_SCRIPT_URL = '/wasm/tap_to_audio.js'

export default function TapToWav() {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [convertedFilename, setConvertedFilename] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize WASM module
  useEffect(() => {
    const loadWasmScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script is already loaded
        if (document.getElementById(WASM_SCRIPT_ID)) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.id = WASM_SCRIPT_ID
        script.src = WASM_SCRIPT_URL
        script.async = true
        
        script.onload = () => { console.log('WASM script loaded'); resolve() }
        script.onerror = () => { console.error('Failed to load WASM script'); reject(new Error('Failed to load WASM script')) }
        
        document.body.appendChild(script)
      })
    }

    const initWasm = async () => {
      try {
        await loadWasmScript()
        const module = await createTapeModule()
        setWasmModule(module)
        console.log('WASM module initialized')
      } catch (err) {
        setError('Failed to initialize converter')
        console.error('WASM init error:', err)
      }
    }

    initWasm()

    // Cleanup
    return () => {
      const script = document.getElementById(WASM_SCRIPT_ID)
      if (script) {
        script.remove()
      }
    }
  }, [])

  const handleFile = async (file: File) => {
    try {
      setError('')
      setIsProcessing(true)

      const tapeFile = await findTapeFile(file)
      if (!tapeFile) {
        throw new Error('No valid TAP or TZX file found')
      }

      if (!wasmModule) {
        throw new Error('Converter not initialized')
      }

      // Get WAV filename
      const wavFilename = `${tapeFile.name.replace(/\.[^/.]+$/, '')}.wav`
      setConvertedFilename(wavFilename)

      // Convert to WAV using WASM module
      try {
        const isTap = tapeFile.name.toLowerCase().endsWith('.tap')
        const wavData = wasmModule.convertTapeFile(tapeFile.data, isTap)

        if (wavData) {
          // Create blob and URL for preview and download
          const blob = new Blob([wavData], { type: 'audio/wav' })
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
        } else {
          throw new Error('Conversion failed')
        }
      } catch (err) {
        console.error('Conversion error:', err)
        throw new Error('Failed to convert file')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [])

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
        <title>ZX Spectrum TAP/TZX to WAV Converter</title>
        <meta name="description" content="Convert ZX Spectrum TAP and TZX files to WAV audio format" />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">TAP/TZX to WAV Converter</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="mb-4">Convert your ZX Spectrum TAP and TZX files to WAV audio format.</p>
        
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
          <p className="text-gray-400">or drag and drop your TAP/TZX file here</p>
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

        {previewUrl && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{convertedFilename}</h3>
              <a
                href={previewUrl}
                download={convertedFilename}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
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
                Download WAV
              </a>
            </div>
            <WaveformVisualizer audioRef={audioRef} />
            <audio ref={audioRef} controls src={previewUrl} className="w-full" />
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">About TAP and TZX Files</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            TAP and TZX files are digital representations of ZX Spectrum tape recordings. When converted
            to WAV format, they can be played through modern audio equipment to load programs into real
            ZX Spectrum hardware.
          </p>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">File Formats</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">TAP Format</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Simple tape recording format</li>
                  <li>Stores raw tape data blocks</li>
                  <li>No timing information</li>
                  <li>Standard loading speed only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">TZX Format</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Advanced tape container</li>
                  <li>Preserves custom loading schemes</li>
                  <li>Includes timing information</li>
                  <li>Supports turbo loaders</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">References</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://worldofspectrum.org/faq/reference/formats.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">Emulator File Formats</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Comprehensive guide to various ZX Spectrum emulator file formats, including detailed 
                    information about TAP and TZX formats from World of Spectrum.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://worldofspectrum.net/TZXformat.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">TZX Format Specification</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Technical specification of the TZX format, including detailed documentation of its 
                    structure, block types, and advanced features for preserving tape timing information.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">TAP Format Description</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Detailed technical description of the TAP file format, explaining how it stores and 
                    represents ZX Spectrum tape data in a simplified format.
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