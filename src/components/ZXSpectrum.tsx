import { useEffect, useRef, useState } from 'react';

// Define module type for the emscripten module
interface EmscriptenModule {
  canvas: HTMLCanvasElement;
  setStatus: (status: string) => void;
  monitorRunDependencies: (left: number) => void;
  preRun: (() => void)[];
  postRun: (() => void)[];
  print: (text: string) => void;
  printErr: (text: string) => void;
  locateFile?: (path: string, prefix: string) => string;
  loadDroppedFile?: (filename: string, arrayBuffer: ArrayBuffer) => void;
  stop?: () => void;
  requestFullscreen?: () => void;
}

declare global {
  interface Window {
    Module: EmscriptenModule;
  }
}

interface Props {
  file?: {
    name: string;
    data: Uint8Array;
  };
  onError?: (error: string) => void;
  title: string;
}

export default function ZXSpectrum({ file, onError, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlay = async () => {
    setShowPlayButton(false);
    // Create audio context to initialize audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    await audioContext.resume();

    if (canvasRef.current) {
      initEmulator();
    }
  };

  const initEmulator = async () => {
    try {
      // Create the Emscripten Module configuration
      window.Module = {
        canvas: canvasRef.current!,
        print: (text: string) => {
          console.log(text);
        },
        setStatus: (text: string) => {
          console.log('Status:', text);
        },
        monitorRunDependencies: (left: number) => {
          console.log('Dependencies remaining:', left);
          if (left === 0) {
            setIsInitialized(true);
            window.setTimeout(() => {
              if (file) {
                window.Module.loadDroppedFile?.(file.name, file.data);
              }
            }, 100);
          }
        },
        preRun: [],
        postRun: [],
        printErr: (text: string) => {
          console.error(text);
          onError?.(text);
        },
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            return '/wasm/zx_emulator.wasm';
          }
          return prefix + path;
        }
      };

      // Handle WebGL context loss
      canvasRef.current?.addEventListener("webglcontextlost", (e: Event) => {
        onError?.('WebGL context lost. You will need to reload the page.');
        e.preventDefault();
      }, false);

      // Load the emulator script
      const script = document.createElement('script');
      script.src = '/wasm/zx_emulator.js';
      script.async = false;
      script.onerror = (err) => {
        console.error('Failed to load emulator script:', err);
        onError?.('Failed to load emulator');
      };
      script.onload = () => {
        console.log("Emulator script loaded");
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Failed to initialize emulator:', error);
      onError?.('Failed to initialize emulator');
    }
  };

  useEffect(() => {
    if (!showPlayButton && !isInitialized && canvasRef.current) {
      initEmulator();
    }

    return () => {
      if (window.Module?.stop && isInitialized) {
        console.log("Stopping emulator");
        window.Module.stop();
      }
    };
  }, [showPlayButton, isInitialized, canvasRef.current]);

  useEffect(() => {
    const originalTitle = document.title;
    if (title) {
      document.title = `${title} - ZX Spectrum Emulator`;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [title]);

  const handleFullscreen = () => {
    if (window.Module?.requestFullscreen) {
      window.Module.requestFullscreen();
    }
  };

  return (
    <div className="relative">
      <canvas
        id="canvas"
        ref={canvasRef}
        width={640}
        height={480}
        className="bg-black w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Fullscreen button */}
      {!showPlayButton && (
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 bg-gray-800/50 hover:bg-gray-700/50 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          title="Enter fullscreen"
        >
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fullscreen
          </>
        </button>
      )}

      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <button
            onClick={handlePlay}
            className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            {title ? `Start ${title}` : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
} 