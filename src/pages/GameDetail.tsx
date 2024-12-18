import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ZXDBCredit from '../components/ZXDBCredit';

const SPECTRUM_COMPUTING_BASE_URL = 'https://spectrumcomputing.co.uk';

interface Game {
  i: number;  // id
  t: string;  // title
  g: string;  // genre
  m: string;  // machine
  f: {        // files
    l: string;  // link
    y: string;  // type
    s: number | null;  // size (can be null)
  }[];
}

// Helper function to ensure URL has correct base
function ensureBaseUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${SPECTRUM_COMPUTING_BASE_URL}${url}`;
}

// Helper function to get image files
function getImageFiles(files: Game['f']): Game['f'] {
  const imageExtensions = ['.gif', '.png', '.jpg', '.jpeg'];
  
  return files.filter(f => 
    imageExtensions.some(ext => f.l.toLowerCase().endsWith(ext))
  );
}

// Helper function to get filename from URL
function getFilenameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get the return URL with preserved parameters
  const backToGamesUrl = (() => {
    const letter = searchParams.get('letter');
    const page = searchParams.get('page');
    let url = '/games';
    if (letter) {
      url += `?letter=${letter}`;
      if (page) {
        url += `&page=${page}`;
      }
    }
    return url;
  })();

  useEffect(() => {
    async function fetchGame() {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // First, fetch the index to find which letter and page contains this game
        const indexResponse = await fetch('/data/index.json');
        if (!indexResponse.ok) throw new Error('Failed to fetch index');
        const indexData = await indexResponse.json();
        
        // Find the game in the index
        const indexEntry = indexData.find((entry: { i: number }) => entry.i === parseInt(id));
        if (!indexEntry) throw new Error('Game not found');

        // Fetch the page containing the game
        const gamesResponse = await fetch(`/data/${indexEntry.l}/${indexEntry.p}.json`);
        if (!gamesResponse.ok) throw new Error('Failed to fetch game details');
        const gamesData = await gamesResponse.json();

        // Find the specific game in the page and process URLs
        const gameData = gamesData.find((g: Game) => g.i === parseInt(id));
        if (!gameData) throw new Error('Game not found in page');

        // Process all file URLs
        const processedGame = {
          ...gameData,
          f: gameData.f.map((file: Game['f'][0]) => ({
            ...file,
            l: ensureBaseUrl(file.l)
          }))
        };

        setGame(processedGame);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGame();
  }, [id]);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow p-8">
          <Link to={backToGamesUrl} className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
            ← Back to Games
          </Link>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow p-8">
          <div className="text-center text-red-400">
            <p>{error || 'Game not found'}</p>
            <Link to={backToGamesUrl} className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <Link to={backToGamesUrl} className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
            ← Back to Games
          </Link>
          
          <div className="flex justify-between items-center mt-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-100">{game.t}</h1>
            {getImageFiles(game.f).length > 0 && (
              <a 
                href="#files" 
                className="text-indigo-400 hover:text-indigo-300 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('files')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Jump to Files ↓
              </a>
            )}
          </div>

          <ZXDBCredit />
          
          {/* Image Gallery */}
          {getImageFiles(game.f).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Screenshots</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getImageFiles(game.f).map((file, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(file.l)}
                  >
                    <img
                      src={file.l}
                      alt={file.y}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm truncate">{file.y}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-4xl w-full">
                <img
                  src={selectedImage}
                  alt="Full size screenshot"
                  className="w-full h-auto rounded-lg"
                />
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                  onClick={() => setSelectedImage(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Files Section */}
          <div id="files">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Files</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {game.f.length > 0 ? (
                <ul className="space-y-2">
                  {game.f.map((file, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-gray-300">{file.y}</span>
                        <span className="text-sm text-gray-400">{getFilenameFromUrl(file.l)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {file.s && (
                          <span className="text-gray-400">{formatFileSize(file.s)}</span>
                        )}
                        <a
                          href={file.l}
                          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300">No files available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 