import { useState, useEffect } from 'react';
import { Game } from '../../types/game';
import { getProxyUrl } from '../../utils/urls';
import Emulator from '../Emulator';

interface Props {
  file: Game['f'][0];
  game: Game;
  onClose: () => void;
}

export default function GamePlayer({ file, game, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{name: string; data: Uint8Array} | null>(null);

  useEffect(() => {
    async function loadGameFile() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Dynamically import JSZip
        const JSZip = (await import('jszip')).default;
        
        // Download the ZIP file using proxy
        const response = await fetch(getProxyUrl(file.l));
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
          data: content
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
        console.error('Game loading error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGameFile();
  }, [file.l]);

  const handleEmulatorError = (error: string) => {
    setError(error);
  };

  return (
    <section className="mb-8 bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Playing: {game.t}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200"
          aria-label="Close emulator"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex justify-center">
        <div 
          className="relative bg-black rounded-lg"
          style={{
            width: '640px',
            height: '480px',
            maxWidth: '100%',
            aspectRatio: '4/3'
          }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-400">
              {error}
            </div>
          ) : gameData ? (
            <Emulator
              file={gameData}
              onError={handleEmulatorError}
            />
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-gray-400">
              Loading emulator...
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Stop Game
        </button>
      </div>
    </section>
  );
} 