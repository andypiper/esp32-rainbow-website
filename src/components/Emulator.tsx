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
}

export default function Emulator({ file, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate canvas dimensions
  const canvasWidth = 640;
  const canvasHeight = 480;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    if (!isStarted) {
      return;
    }
    // don't initialize more than once
    if (isInitialized) {
      return;
    }

    const canvas = canvasRef.current;
    const initEmulator = async () => {
      try {
        // Create the Emscripten Module configuration
        window.Module = {
          canvas,
          print: (text: string) => {
            console.log(text);
          },
          setStatus: (text: string) => {
            console.log('Status:', text);
          },
          monitorRunDependencies: (left: number) => {
            console.log('Dependencies remaining:', left);
          },
          preRun: [],
          postRun: [],
          printErr: (text: string) => {
            console.error(text);
          },
          locateFile: (path: string, prefix: string) => {
            if (path.endsWith('.wasm')) {
              return '/wasm/zx_emulator.wasm';
            }
            return prefix + path;
          }
        };

        // Handle WebGL context loss
        canvas.addEventListener("webglcontextlost", (e) => {
          alert('WebGL context lost. You will need to reload the page.');
          e.preventDefault();
        }, false);

        // Load the emulator script
        const script = document.createElement('script');
        script.src = '/wasm/zx_emulator.js';
        script.async = false;
        script.onerror = (err) => {
          console.error('Failed to load emulator script:', err);
        };
        document.body.appendChild(script);
        setIsInitialized(true);

        setTimeout(() => {
          if (window.Module && window.Module.loadDroppedFile && file) {
            window.Module.loadDroppedFile(file.name, file.data);
          }
        }, 3000);
      } catch (error) {
        console.error('Failed to initialize emulator:', error);
      }
    };

    console.log("******* init Emulator ***");
    initEmulator();

    return () => {
      const script = document.querySelector('script[src="/wasm/zx_emulator.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [canvasRef.current, isStarted, file, isInitialized]);

  // Update drag and drop handlers to check isStarted
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    if (window.Module && window.Module.loadDroppedFile) {
      window.Module.loadDroppedFile(file.name, arrayBuffer);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-2">
      <div className="relative py-1 mx-auto">
        <div className={`bg-gray-800 rounded-lg shadow-lg p-4 mx-auto max-w-[672px] w-[95%]`}>
          {/* Description */}
          <div className="text-gray-300 mb-4 text-sm">
            <p className="mb-2">
              This is the same ZX Spectrum emulator that runs on the ESP32 Rainbow hardware.
              It has been compiled from C++ to WebAssembly using Emscripten to run directly in your browser.
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-900/50 border border-yellow-600/50 text-yellow-200 p-3 mb-4 rounded-md text-sm">
            <p>⚠️ The web version of the emulator is a work in progress and may have limited functionality.</p>
          </div>

          {!isStarted ? (
            <div className="flex justify-center items-center" style={{height: '480px'}}>
              <button
                onClick={() => setIsStarted(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Click to Start Emulator
              </button>
            </div>
          ) : (
            /* Emulator Canvas with drag handlers */
            <div 
              className={`border border-gray-700 flex justify-center mx-auto relative aspect-[4/3] w-full max-w-[640px]`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
            >
              <canvas 
                id="canvas"
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="bg-black w-full h-full"
                onContextMenu={(e) => e.preventDefault()}
                tabIndex={-1}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drop Zone Overlay */}
      {isStarted && isDragging && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center text-white text-2xl font-sans"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          Drop TAP, TZX, or Z80 file here
        </div>
      )}
    </div>
  );
} 