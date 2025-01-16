import { Helmet } from 'react-helmet-async'
import { useState, useCallback, useRef } from 'react'
import { SpectrumScreen, SPECTRUM_COLORS } from '../utils/SpectrumScreen'

// Only the first 8 colors (non-bright) are valid border colors
const BORDER_COLORS = SPECTRUM_COLORS.slice(0, 8)
const BORDER_WIDTH = 20

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

    const borderPx = showBorder ? BORDER_WIDTH * scale : 0
    tempCanvas.width = (originalCanvas.width * scale) + (borderPx * 2)
    tempCanvas.height = (originalCanvas.height * scale) + (borderPx * 2)

    // Fill with border color if enabled
    if (showBorder) {
      const [r, g, b] = BORDER_COLORS[borderColor]
      tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    }
    
    tempCtx.imageSmoothingEnabled = false
    tempCtx.drawImage(
      originalCanvas,
      borderPx, borderPx,
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
      
      <div className="bg-gray-800 rounded-lg p-6">
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
                  width: `${(256 * scale) + (showBorder ? BORDER_WIDTH * 2 * scale : 0)}px`,
                  height: `${(192 * scale) + (showBorder ? BORDER_WIDTH * 2 * scale : 0)}px`,
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
                    top: showBorder ? BORDER_WIDTH * scale : 0,
                    left: showBorder ? BORDER_WIDTH * scale : 0,
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
                Output size: {256 * scale + (showBorder ? BORDER_WIDTH * 2 * scale : 0)} × {192 * scale + (showBorder ? BORDER_WIDTH * 2 * scale : 0)} pixels
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 