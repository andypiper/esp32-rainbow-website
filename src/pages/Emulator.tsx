import { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';

// Add screen size hook
const useScreenSize = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < 640 // sm breakpoint in Tailwind
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isSmallScreen;
};

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

// Add these keyboard mappings
const SPECTRUM_KEYS = {
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  topRow: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  middleRow: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Enter'],
  bottomRow: ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Space', 'Sym']
};

// Add this component for the virtual keyboard
const VirtualKeyboard = ({ onKeyPress, onKeyRelease }) => {
  const handleTouchStart = useCallback((key: string) => {
    onKeyPress(key);
  }, [onKeyPress]);

  const handleTouchEnd = useCallback((key: string) => {
    onKeyRelease(key);
  }, [onKeyRelease]);

  const renderKey = (key: string) => (
    <button
      key={key}
      className="bg-gray-700 text-white rounded p-2 text-sm uppercase hover:bg-gray-600 active:bg-gray-500"
      onTouchStart={() => handleTouchStart(key)}
      onTouchEnd={() => handleTouchEnd(key)}
      onMouseDown={() => handleTouchStart(key)}
      onMouseUp={() => handleTouchEnd(key)}
      onMouseLeave={() => handleTouchEnd(key)}
    >
      {key}
    </button>
  );

  return (
    <div className="bg-gray-800 p-2 rounded-t-lg">
      <div className="grid grid-cols-10 gap-1 mb-1">
        {SPECTRUM_KEYS.numbers.map(renderKey)}
      </div>
      <div className="grid grid-cols-10 gap-1 mb-1">
        {SPECTRUM_KEYS.topRow.map(renderKey)}
      </div>
      <div className="grid grid-cols-10 gap-1 mb-1">
        {SPECTRUM_KEYS.middleRow.map(renderKey)}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {SPECTRUM_KEYS.bottomRow.map(renderKey)}
      </div>
    </div>
  );
};

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isSmallScreen = useScreenSize();
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Calculate canvas dimensions
  const canvasWidth = isSmallScreen ? 320 : 640;
  const canvasHeight = isSmallScreen ? 240 : 480;

  // Add a hidden input that we'll focus to show keyboard
  const inputRef = useRef<HTMLInputElement>(null);

  const showMobileKeyboard = () => {
    inputRef.current?.focus();
  };

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
  }, [canvasRef.current, isStarted, isInitialized]);

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

  // Add these handlers
  const handleKeyPress = useCallback((key: string) => {
    if (window.Module) {
      // Convert key to keycode and send to emulator
      const event = new KeyboardEvent('keydown', { key });
      window.dispatchEvent(event);
    }
  }, []);

  const handleKeyRelease = useCallback((key: string) => {
    if (window.Module) {
      // Convert key to keycode and send to emulator
      const event = new KeyboardEvent('keyup', { key });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-2">
      <Helmet>
        <title>ZX Spectrum Emulator</title>
      </Helmet>

      <div className="relative py-1 mx-auto">
        <div className={`bg-gray-800 rounded-lg shadow-lg p-4 mx-auto ${isSmallScreen ? 'w-[352px]' : 'w-[672px]'}`}>
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
            <div className="flex justify-center items-center" style={{height: isSmallScreen ? '240px' : '480px'}}>
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
              className={`border border-gray-700 flex justify-center mx-auto relative ${
                isSmallScreen ? 'w-[320px]' : 'w-[640px]'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
            >
              <canvas 
                id="canvas"
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="bg-black"
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

      {isStarted && isSmallScreen && (
        <>
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 fixed bottom-0 left-0 w-px h-px"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={showMobileKeyboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
            >
              Show Keyboard
            </button>
          </div>
        </>
      )}
    </div>
  );
} 