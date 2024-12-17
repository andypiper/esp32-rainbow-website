import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('');

// Using short keys from JSON
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

interface PaginationInfo {
  p: number;  // pages
}

export default function Games() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch games data when letter or page changes
  useEffect(() => {
    async function fetchGames() {
      if (!selectedLetter) {
        setGames([]);
        setPaginationInfo(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch pagination info first
        const infoResponse = await fetch(`/data/${selectedLetter}/info.json`);
        if (!infoResponse.ok) throw new Error('Failed to fetch pagination info');
        const info: PaginationInfo = await infoResponse.json();
        setPaginationInfo(info);

        // Fetch games for current page
        const gamesResponse = await fetch(`/data/${selectedLetter}/${currentPage}.json`);
        if (!gamesResponse.ok) throw new Error('Failed to fetch games');
        const gamesData: Game[] = await gamesResponse.json();
        setGames(gamesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setGames([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [selectedLetter, currentPage]);

  // Reset to page 1 when letter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLetter]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-100">ZX Spectrum Games</h1>
      
      {/* Search Box */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-100"
        />
      </div>

      {/* Letter Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors
              ${letter === selectedLetter
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
              }`}
          >
            {letter === '_' ? '#' : letter}
          </button>
        ))}
      </div>

      {/* Games List */}
      <div className="bg-gray-800 rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p>Loading games...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {games.map((game) => (
                <Link
                  key={game.i}
                  to={`/games/${game.i}`}
                  className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-100 mb-2 truncate" title={game.t}>{game.t}</h3>
                  <div className="text-gray-300 text-sm">
                    <p className="truncate">Genre: {game.g}</p>
                    <p className="truncate">Machine: {game.m}</p>
                    {game.f.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold mb-1">Files: {game.f.length}</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {paginationInfo && paginationInfo.p > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-700">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                <span className="text-gray-300">
                  Page {currentPage} of {paginationInfo.p}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(paginationInfo.p, prev + 1))}
                  disabled={currentPage === paginationInfo.p}
                  className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-300">
            {selectedLetter ? (
              <p>No games found for letter {selectedLetter === '_' ? '#' : selectedLetter}</p>
            ) : searchQuery ? (
              <p>No games found for: {searchQuery}</p>
            ) : (
              <p>Select a letter to view games</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 