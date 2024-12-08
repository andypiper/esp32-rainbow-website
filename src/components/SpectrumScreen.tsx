interface SpectrumScreenProps {
  // Will add props for actual screen data later
  className?: string
}

export default function SpectrumScreen({ className = '' }: SpectrumScreenProps) {
  // Constants for ZX Spectrum screen dimensions
  const BORDER_SIZE = 20
  const SCREEN_WIDTH = 256
  const SCREEN_HEIGHT = 192
  const TOTAL_WIDTH = SCREEN_WIDTH + (BORDER_SIZE * 2)
  const TOTAL_HEIGHT = SCREEN_HEIGHT + (BORDER_SIZE * 2)

  return (
    <div 
      className={`relative bg-black ${className}`}
      style={{
        width: TOTAL_WIDTH,
        height: TOTAL_HEIGHT,
        // Maintain aspect ratio when scaling
        minWidth: TOTAL_WIDTH,
        minHeight: TOTAL_HEIGHT,
      }}
    >
      {/* Border area */}
      <div 
        className="absolute inset-0 bg-gray-700"
        style={{ padding: BORDER_SIZE }}
      >
        {/* Main screen area */}
        <div className="w-full h-full bg-black">
          {/* Screen content will go here */}
        </div>
      </div>
    </div>
  )
} 