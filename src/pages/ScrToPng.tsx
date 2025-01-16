import { Helmet } from 'react-helmet-async'
import { useState, useCallback, useRef } from 'react'
import { SpectrumScreen, SPECTRUM_COLORS } from '../utils/SpectrumScreen'

// Only the first 8 colors (non-bright) are valid border colors
const BORDER_COLORS = SPECTRUM_COLORS.slice(0, 8)
const BORDER_WIDTH_H = 48  // Horizontal border width (left and right)
const BORDER_WIDTH_V = 40  // Vertical border width (top and bottom)

const CodeSnippet = () => {
  return (
    <pre style={styles.pre}>
      <code style={styles.code}>
        {`// For pixel at (x,y), where y=0-191 and x=0-255:
col = x >> 3                    `}<span style={styles.comment}>{`{/* Convert x to character column (0-31) */}`}</span>
        {`
y76 = y & 0b11000000           `}<span style={styles.comment}>{`{/* Top 2 bits select the third */}`}</span>
        {`
y210 = (y & 0b00000111) << 3   `}<span style={styles.comment}>{`{/* Bottom 3 bits select char row in third */}`}</span>
        {`
y543 = (y & 0b00111000) >> 3   `}<span style={styles.comment}>{`{/* Middle 3 bits select pixel row in char */}`}</span>
        {`
address = (y76 + y210 + y543) * 32 + col
bit = 7 - (x & 0b111)          `}<span style={styles.comment}>{`{/* Position in byte (leftmost = bit 7) */}`}</span>
      </code>
    </pre>
  );
};

const styles = {
  pre: {
    backgroundColor: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
    overflow: "auto" as const,
    fontFamily: "Consolas, 'Courier New', monospace",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  code: {
    color: "#2d2d2d",
  },
  comment: {
    color: "#6a9955",
    fontStyle: "italic",
  },
} as const;

export default function ScrToPng() {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState<number>(1)
  const [showBorder, setShowBorder] = useState(false)
  const [borderColor, setBorderColor] = useState(0) // Index into BORDER_COLORS
  const spectrumScreen = useRef<SpectrumScreen>(new SpectrumScreen())

  const handleFile = async (file: File) => {
    try {
      setError('')
      if (!file.name.toLowerCase().endsWith('.scr')) {
        throw new Error('Please select a valid SCR file')
      }

      const canvas = await spectrumScreen.current.loadFromFile(file)
      const dataUrl = canvas.toDataURL('image/png')
      setPreviewUrl(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
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

  const createScaledImage = (originalCanvas: HTMLCanvasElement) => {
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return null

    const borderH = showBorder ? BORDER_WIDTH_H * scale : 0
    const borderV = showBorder ? BORDER_WIDTH_V * scale : 0
    tempCanvas.width = (originalCanvas.width * scale) + (borderH * 2)
    tempCanvas.height = (originalCanvas.height * scale) + (borderV * 2)

    // Fill with border color if enabled
    if (showBorder) {
      const [r, g, b] = BORDER_COLORS[borderColor]
      tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    }
    
    tempCtx.imageSmoothingEnabled = false
    tempCtx.drawImage(
      originalCanvas,
      borderH, borderV,
      originalCanvas.width * scale,
      originalCanvas.height * scale
    )

    return tempCanvas
  }

  const handleDownload = () => {
    if (!previewUrl) return

    const originalCanvas = spectrumScreen.current.getCanvas()
    const scaledCanvas = createScaledImage(originalCanvas)
    if (!scaledCanvas) return

    const link = document.createElement('a')
    link.href = scaledCanvas.toDataURL('image/png')
    link.download = `spectrum-screen-${scale}x${showBorder ? '-border' : ''}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const scaleOptions = [1, 2, 3, 4]

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>SCR to PNG Converter - ESP32 Rainbow</title>
        <meta name="description" content="Convert ZX Spectrum SCR screenshot files to PNG format" />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">SCR to PNG Converter</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="mb-4">Convert your ZX Spectrum SCR files to PNG format.</p>
        
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
                Select SCR File
              </span>
              <input
                type="file"
                accept=".scr"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-gray-400">or drag and drop your SCR file here</p>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {previewUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">Preview:</h2>
            
            <div className="mb-4 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-300">Scale:</span>
                <div className="flex gap-2">
                  {scaleOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setScale(option)}
                      className={`px-3 py-1 rounded ${
                        scale === option
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {option}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Add border</span>
                </label>

                {showBorder && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">Color:</span>
                    <div className="flex gap-1">
                      {BORDER_COLORS.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setBorderColor(index)}
                          className={`w-6 h-6 rounded ${
                            borderColor === index ? 'ring-2 ring-white' : ''
                          }`}
                          style={{
                            backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
                          }}
                          title={`Color ${index}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <div
                style={{
                  width: `${(256 * scale) + (showBorder ? BORDER_WIDTH_H * 2 * scale : 0)}px`,
                  height: `${(192 * scale) + (showBorder ? BORDER_WIDTH_V * 2 * scale : 0)}px`,
                  backgroundColor: showBorder ? 
                    `rgb(${BORDER_COLORS[borderColor].join(',')})` : 
                    'transparent'
                }}
                className="relative"
              >
                <img 
                  src={previewUrl} 
                  alt="Converted SCR preview" 
                  className="pixelated absolute"
                  style={{
                    top: showBorder ? BORDER_WIDTH_V * scale : 0,
                    left: showBorder ? BORDER_WIDTH_H * scale : 0,
                    width: `${256 * scale}px`,
                    height: `${192 * scale}px`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Download PNG ({scale}x)
              </button>
              <span className="text-gray-400">
                Output size: {256 * scale + (showBorder ? BORDER_WIDTH_H * 2 * scale : 0)} × {192 * scale + (showBorder ? BORDER_WIDTH_V * 2 * scale : 0)} pixels
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">The ZX Spectrum Screen Layout</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            The ZX Spectrum's screen layout is one of its most iconic features. It uses a 256 × 192 pixel display 
            for the main graphics area, with additional space reserved for attribute (color) data. The layout was 
            designed to maximize capabilities within the machine's limited memory while providing efficient TV signal 
            generation.
          </p>
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Graphics Memory Structure</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Pixel Graphics Area</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Resolution: 256 × 192 pixels</li>
                  <li>Monochrome bitmap (1 bit per pixel)</li>
                  <li>8 pixels per byte, horizontally</li>
                  <li>Total size: 6,144 bytes (6K)</li>
                  <li>Memory: 0x4000 to 0x5800</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Attribute Data</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>32 × 24 attribute cells</li>
                  <li>Each cell controls 8×8 pixels</li>
                  <li>1 byte per cell defining:</li>
                  <ul className="list-disc list-inside ml-6">
                    <li>INK color (bits 0-2)</li>
                    <li>PAPER color (bits 3-5)</li>
                    <li>BRIGHT flag (bit 6)</li>
                    <li>FLASH flag (bit 7)</li>
                  </ul>
                  <li>Total size: 768 bytes</li>
                  <li>Memory: 0x5800 to 0x5AFF</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Pixel Layout</h3>
            <p className="mb-2">
              The screen memory is organized in three vertical "bands" of 64 lines each, using an 
              interleaved storage pattern that optimized TV signal generation:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Screen Organization:</strong>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>24 rows of 8-pixel-high character blocks</li>
                  <li>Each block row subdivided into top, middle, and bottom parts</li>
                  <li>Memory stores all top rows first, then middle rows, then bottom rows</li>
                </ul>
              </li>
              <li>
                <strong>Pixel Address Calculation:</strong>
                <CodeSnippet />
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Color System</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Color Palette</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>8 base colors:</li>
                  <ul className="list-disc list-inside ml-6">
                    <li>Black, Blue, Red, Magenta</li>
                    <li>Green, Cyan, Yellow, White</li>
                  </ul>
                  <li>BRIGHT flag doubles colors (except black)</li>
                  <li>Total of 15 unique colors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Color Limitations</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>One attribute byte per 8×8 block</li>
                  <li>Only two colors per block (plus bright)</li>
                  <li>Famous "color clash" limitation</li>
                  <li>FLASH alternates colors at 1.5Hz</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Border Area</h3>
            <p>
              The ZX Spectrum display included a border region around the main screen, controlled by the ULA 
              (Uncommitted Logic Array). The border extends 48 pixels horizontally and 40 pixels vertically 
              beyond the main display area. It can be set to any of the 8 base colors (without bright variants) 
              and can be changed dynamically during screen rendering.
            </p>
          </div>

          <p className="italic">
            This unique display architecture created the distinctive ZX Spectrum aesthetic that remains 
            instantly recognizable today. Our converter faithfully reproduces these technical characteristics 
            to create authentic PNG representations of original Spectrum screenshots.
          </p>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Further Reading</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://www.youtube.com/watch?v=9-lA2F2uyA4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">ZX Spectrum Hardware Introduction (Video)</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    A comprehensive video guide exploring the technical aspects of the ZX Spectrum hardware,
                    including its display system and memory organization.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.overtakenbyevents.com/lets-talk-about-the-zx-specrum-screen-layout/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">The ZX-Spectrum Screen Layout: Part I</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    An in-depth article that explores the intricacies of the ZX Spectrum's screen layout, 
                    including its memory organization and graphical capabilities.
                  </p>
                </a>
              </li>
              <li>
                <a 
                  href="https://espamatica.com/zx-spectrum-screen/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-800 p-3 rounded-lg transition-colors"
                >
                  <h4 className="text-blue-400 font-semibold">ZX Spectrum Screen</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    A detailed breakdown of the ZX Spectrum's screen, including its resolution, 
                    memory allocation, and attribute handling.
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