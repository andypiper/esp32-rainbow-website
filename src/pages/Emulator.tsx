import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // We'll initialize the emulator here once it's ready
    const initEmulator = async () => {
      try {
        // TODO: Add emulator initialization code
        // This will be added once the emulator is compiled with emscripten
      } catch (error) {
        console.error('Failed to initialize emulator:', error);
      }
    };

    initEmulator();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>ESP32 Rainbow - Online Emulator</title>
        <meta name="description" content="Try out the ESP32 Rainbow emulator directly in your browser. Test and experiment with LED patterns without hardware." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">ESP32 Rainbow Emulator</h1>
          <p className="text-gray-300 mb-8">
            Experience the ESP32 Rainbow directly in your browser. 
            Test patterns and configurations without physical hardware.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <canvas 
            ref={canvasRef}
            className="w-full border border-gray-700 rounded-lg"
            width="800"
            height="600"
          />
          
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
              {/* Add control buttons/inputs here */}
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Output</h2>
              {/* Add emulator output/status here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 