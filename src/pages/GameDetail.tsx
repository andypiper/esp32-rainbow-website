import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Find the specific game in the page
        const gameData = gamesData.find((g: Game) => g.i === parseInt(id));
        if (!gameData) throw new Error('Game not found in page');

        setGame(gameData);
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
            <Link to="/games" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
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
          <Link to="/games" className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
            ← Back to Games
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-100 mt-4 mb-6">{game.t}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">Details</h2>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-300"><span className="font-medium">Genre:</span> {game.g}</p>
                  <p className="text-gray-300"><span className="font-medium">Machine:</span> {game.m}</p>
                  <p className="text-gray-300"><span className="font-medium">ID:</span> {game.i}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Files</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                {game.f.length > 0 ? (
                  <ul className="space-y-2">
                    {game.f.map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{file.y}</span>
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
    </div>
  );
} 