import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

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
}

declare global {
  interface Window {
    Module: EmscriptenModule;
  }
}

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Wait for the canvas to be available
    if (!canvasRef.current) {
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
        script.async = true;
        script.onerror = (err) => {
          console.error('Failed to load emulator script:', err);
        };
        document.body.appendChild(script);

      } catch (error) {
        console.error('Failed to initialize emulator:', error);
      }
    };

    initEmulator();

    return () => {
      const script = document.querySelector('script[src="/wasm/zx_emulator.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [canvasRef.current]); // Add canvas ref to dependencies

  return (
    <div className="min-h-screen bg-gray-900 py-2">
      <Helmet>
        <title>ZX Spectrum Emulator</title>
      </Helmet>

      <div className="relative py-1 sm:max-w-[672px] sm:mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 w-[672px]">
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

          {/* Emulator Canvas */}
          <div className="border border-gray-700 flex justify-center w-[640px] mx-auto">
            <canvas 
              id="canvas"
              ref={canvasRef}
              width={640}
              height={480}
              className="bg-black"
              onContextMenu={(e) => e.preventDefault()}
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 