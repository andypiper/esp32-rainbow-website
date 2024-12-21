import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Banner from '../components/Banner';
import ZXSpectrum from '../components/ZXSpectrum';

export default function EmulatorPopup() {
  const [searchParams] = useSearchParams();
  const [gameData, setGameData] = useState<{name: string; data: Uint8Array, is128k: boolean} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const title = searchParams.get('title');
  const machine = searchParams.get('machine');

  useEffect(() => {
    async function loadGameFile() {
      const fileUrl = searchParams.get('file');
      if (!fileUrl) {
        setError('No file URL provided');
        return;
      }

      try {
        // Dynamically import JSZip
        const JSZip = (await import('jszip')).default;
        
        // Download the ZIP file
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to download game file');
        
        const zipData = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        
        // Find the relevant file in the ZIP
        const files = Object.keys(zip.files);
        const gameFile = files.find(name => 
          /\.(tap|tzx|z80)$/i.test(name)
        );
        
        if (!gameFile) {
          throw new Error('No compatible game file found in archive');
        }

        // Extract the file content
        const content = await zip.file(gameFile)?.async('uint8array');
        if (!content) {
          throw new Error('Failed to extract game file');
        }

        setGameData({
          name: gameFile,
          data: content,
          is128k: machine === '128k',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setIsLoading(false);
      }
    }

    loadGameFile();
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>{title ? `${title} - ZX Spectrum Emulator` : 'ZX Spectrum Emulator'}</title>
      </Helmet>
      <Banner />
      <div className="min-h-screen bg-gray-900 p-8">
        {/* Center container with max width for text content */}
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6">
            {title || 'ZX Spectrum Emulator'}
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            This is the same ZX Spectrum emulator that runs on the ESP32 Rainbow hardware. 
            It has been compiled from C++ to WebAssembly using Emscripten to run directly in your browser.
          </p>

          {/* Warning Message */}
          <div className="bg-yellow-900/50 border border-yellow-600/50 text-yellow-200 p-4 mb-8 rounded-lg">
            <p>⚠️ The web version of the emulator is a work in progress and may have limited functionality.</p>
          </div>

          {/* Fixed-width container for emulator, centered */}
          <div className="flex justify-center flex-col items-center">
            <div className="w-[640px] bg-black rounded-xl overflow-hidden shadow-2xl">
              <div className="relative h-[480px]">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-red-500 text-center p-4">
                      <p>{error}</p>
                      <button 
                        onClick={() => window.close()} 
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Close Window
                      </button>
                    </div>
                  </div>
                )}
                
                {gameData && <ZXSpectrum file={gameData} title={title || ''} />}
              </div>
            </div>
            
            {/* Navigation hint */}
            <p className="text-gray-400 mt-4 text-sm">
              Close this tab to return to the game details
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 