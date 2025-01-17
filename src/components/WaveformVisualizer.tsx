import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>
}

export default function WaveformVisualizer({ audioRef }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const sourceRef = useRef<MediaElementAudioSourceNode>()

  // Draw grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear background with a stronger green tint
    ctx.fillStyle = 'rgb(0, 20, 0)'
    ctx.fillRect(0, 0, width, height)

    // Add stronger glow effect
    ctx.shadowBlur = 5
    ctx.shadowColor = 'rgba(0, 25, 0, 0.3)'

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 50, 0, 1.0)'
    ctx.lineWidth = 1

    // Vertical grid lines
    const verticalSpacing = width / 10
    for (let x = 0; x <= width; x += verticalSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal grid lines
    const horizontalSpacing = height / 8
    for (let y = 0; y <= height; y += horizontalSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw center lines slightly darker
    ctx.strokeStyle = 'rgba(0, 100, 0, 1.0)'
    ctx.beginPath()
    ctx.moveTo(0, height/2)
    ctx.lineTo(width, height/2)
    ctx.stroke()

    // Reset shadow for waveform
    ctx.shadowBlur = 0
  }

  // Draw waveform
  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    drawGrid(ctx, canvas.width, canvas.height)

    // Draw waveform with stronger glow effect
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgb(0, 255, 0)'
    ctx.shadowBlur = 15
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)'
    ctx.beginPath()

    const sliceWidth = canvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * canvas.height / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    animationRef.current = requestAnimationFrame(drawWaveform)
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawGrid(ctx, canvas.width, canvas.height)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Handle audio playback and visualization
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const initAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
      }
      return audioContextRef.current
    }

    const setupVisualization = async () => {
      try {
        const audioContext = await initAudioContext()
        
        if (!analyserRef.current) {
          if (sourceRef.current) {
            sourceRef.current.disconnect()
          }
          
          sourceRef.current = audioContext.createMediaElementSource(audio)
          analyserRef.current = audioContext.createAnalyser()
          analyserRef.current.fftSize = 2048
          
          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContext.destination)
        }
        
        drawWaveform()
      } catch (error) {
        console.error('Audio visualization error:', error)
      }
    }

    const handlePlay = () => {
      setupVisualization()
    }

    const handlePauseOrEnd = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePauseOrEnd)
    audio.addEventListener('ended', handlePauseOrEnd)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePauseOrEnd)
      audio.removeEventListener('ended', handlePauseOrEnd)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioRef])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-[100px] bg-black rounded-lg"
    />
  )
} 