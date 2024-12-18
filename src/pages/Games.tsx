import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FlexSearch from 'flexsearch';
import ZXDBCredit from '../components/ZXDBCredit';
import GameTile from '../components/GameTile';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('');
const ITEMS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 300;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SPECTRUM_COMPUTING_BASE_URL = 'https://spectrumcomputing.co.uk';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Using short keys from JSON
interface Game {
  i: number;  // id
  t: string;  // title
  g: string;  // genre
  m: string;  // machine
  sc: number; // score (new)
  f: {        // files
    l: string;  // link
    y: string;  // type
    s: number | null;  // size (can be null)
  }[];
}

interface IndexEntry {
  i: number;  // id
  t: string;  // title
  l: string;  // letter
  p: number;  // page
}

interface PaginationInfo {
  p: number;  // pages
}

// Cache helper functions
async function fetchWithCache<T>(url: string, cacheName: string = 'games-cache'): Promise<T> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    const data = await cachedResponse.json();
    const cacheTimestamp = parseInt(cachedResponse.headers.get('cache-timestamp') || '0');
    
    // Check if cache is still valid
    if (Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
      return data;
    }
  }

  // If no cache or expired, fetch fresh data
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  
  // Create a new response with timestamp
  const data = await response.json();
  const newResponse = new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
      'cache-timestamp': Date.now().toString()
    }
  });
  
  await cache.put(url, newResponse.clone());
  return data;
}

// Helper function to ensure URL has correct base
function ensureBaseUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${SPECTRUM_COMPUTING_BASE_URL}${url}`;
}

// Helper function to get running screen URL
async function getRunningScreenUrl(files: Game['f']): Promise<string | null> {
  const runningScreen = files.find(f => f.y === 'Running screen');
  if (!runningScreen) return null;
  
  const url = ensureBaseUrl(runningScreen.l);
  
  // If it's a SCR file, decode it
  if (url.toLowerCase().endsWith('.scr')) {
    try {
      const screen = new SpectrumScreen();
      await screen.loadFromUrl(url);
      return screen.toDataURL();
    } catch (error) {
      console.error('Failed to decode SCR file:', error);
      return url; // Fallback to original URL if decoding fails
    }
  }
  
  return url;
}

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<IndexEntry[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchIndex = useRef<FlexSearch.Index | null>(null);
  const indexData = useRef<IndexEntry[]>([]);

  // Restore scroll position when returning
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('gamesListScrollPosition');
    if (savedPosition && !isLoading) {
      window.scrollTo(0, parseInt(savedPosition));
      // sessionStorage.removeItem('gamesListScrollPosition');
    }
  }, [isLoading]);

  // Initialize FlexSearch index
  useEffect(() => {
    searchIndex.current = new FlexSearch.Index({
      preset: "match",
      tokenize: "forward",
      cache: true
    });
  }, []);

  // Debounce the search input
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  // Get state from URL parameters
  const selectedLetter = searchParams.get('letter');
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Initialize search index with data
  const initializeSearchIndex = useCallback(async () => {
    if (!indexData.current.length) {
      try {
        const data = await fetchWithCache<IndexEntry[]>('/data/index.json');
        indexData.current = data;
        
        // Add all titles to the search index
        data.forEach((entry, idx) => {
          searchIndex.current?.add(idx, entry.t);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize search index');
      }
    }
  }, []);

  // Handle search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize index if needed
      await initializeSearchIndex();

      // Perform the search
      const results = searchIndex.current?.search(query, {
        limit: 100, // Limit results to prevent too many page fetches
        suggest: true // Enable fuzzy search
      }) as number[];

      // Map results back to IndexEntries
      const matchedEntries = results.map(idx => indexData.current[idx]);
      setSearchResults(matchedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [initializeSearchIndex]);

  // Effect for debounced search
  useEffect(() => {
    performSearch(debouncedSearch);
  }, [debouncedSearch, performSearch]);

  // Update URL when letter changes
  const handleLetterClick = (letter: string | null) => {
    if (letter === selectedLetter) {
      // Deselecting current letter
      searchParams.delete('letter');
      searchParams.delete('page');
    } else {
      // Selecting new letter
      searchParams.set('letter', letter || '');
      searchParams.set('page', '1');
    }
    setSearchParams(searchParams);
    setSearchInput(''); // Clear search input
    setSearchResults([]); // Clear search results
  };

  // Update URL when page changes
  const handlePageChange = (newPage: number) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  // Update URL when search changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
      // Clear letter and page when searching
      newParams.delete('letter');
      newParams.delete('page');
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [searchInput]);

  // Initialize search input from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== searchInput) {
      setSearchInput(searchFromUrl);
      // Clear letter selection if there's a search
      if (selectedLetter) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('letter');
        newParams.delete('page');
        newParams.set('search', searchFromUrl);
        setSearchParams(newParams);
      }
    }
  }, []);

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
        // Fetch pagination info with caching
        const info = await fetchWithCache<PaginationInfo>(`/data/${selectedLetter}/info.json`);
        setPaginationInfo(info);

        // Fetch games for current page with caching
        const gamesData = await fetchWithCache<Game[]>(`/data/${selectedLetter}/${currentPage}.json`);
        // Add base URL to all file links if needed
        const processedGamesData = gamesData.map(game => ({
          ...game,
          f: game.f.map(file => ({
            ...file,
            l: ensureBaseUrl(file.l)
          }))
        }));
        setGames(processedGamesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setGames([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!searchInput) {
      fetchGames();
    }
  }, [selectedLetter, currentPage, searchInput]);

  // Fetch full game details for search results
  useEffect(() => {
    async function fetchSearchResultDetails() {
      if (!searchResults.length) return;

      setIsLoading(true);
      setError(null);

      try {
        // Group results by letter and page
        const gamesByLetterAndPage: Record<string, Record<number, IndexEntry[]>> = {};
        searchResults.forEach(result => {
          if (!gamesByLetterAndPage[result.l]) {
            gamesByLetterAndPage[result.l] = {};
          }
          if (!gamesByLetterAndPage[result.l][result.p]) {
            gamesByLetterAndPage[result.l][result.p] = [];
          }
          gamesByLetterAndPage[result.l][result.p].push(result);
        });

        // Fetch all required pages with caching
        const allGames: Game[] = [];
        for (const [letter, pages] of Object.entries(gamesByLetterAndPage)) {
          for (const [page, _] of Object.entries(pages)) {
            const pageGames = await fetchWithCache<Game[]>(`/data/${letter}/${page}.json`);
            
            // Process file URLs and filter only the games we want from this page
            const wantedIds = new Set(gamesByLetterAndPage[letter][parseInt(page)].map(r => r.i));
            const processedGames = pageGames.map(game => ({
              ...game,
              f: game.f.map(file => ({
                ...file,
                l: ensureBaseUrl(file.l)
              }))
            }));
            const filteredGames = processedGames.filter(game => wantedIds.has(game.i));
            allGames.push(...filteredGames);
          }
        }

        // Sort games to match search results order
        const sortedGames = allGames.sort((a, b) => {
          const aIndex = searchResults.findIndex(r => r.i === a.i);
          const bIndex = searchResults.findIndex(r => r.i === b.i);
          return aIndex - bIndex;
        });

        setGames(sortedGames);
        setPaginationInfo({ p: Math.ceil(sortedGames.length / ITEMS_PER_PAGE) });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setGames([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchResults.length) {
      fetchSearchResultDetails();
    }
  }, [searchResults]);

  // Function to save scroll position
  const handleGameClick = () => {
    const scrollPosition = window.scrollY;
    sessionStorage.setItem('gamesListScrollPosition', scrollPosition.toString());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Under Construction Banner */}
      <div className="bg-yellow-500 text-yellow-900 px-4 py-3 rounded-lg mb-8 flex items-center justify-center space-x-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-medium">Under Construction: We're still working on the games section. Some features may not be available yet.</span>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-gray-100">ZX Spectrum Games</h1>
      
      <ZXDBCredit />
      
      {/* Search Box */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search games by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-100"
        />
        {isLoading && searchInput && (
          <div className="mt-2 text-gray-400 text-sm">
            Searching...
          </div>
        )}
      </div>

      {/* Letter Navigation */}
      <div className={`flex flex-wrap gap-2 mb-8 ${searchInput ? 'opacity-50' : ''}`}>
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            disabled={false}
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
                <GameTile
                  key={game.i}
                  game={game}
                  selectedLetter={selectedLetter}
                  currentPage={currentPage}
                  searchInput={searchInput}
                  onGameClick={handleGameClick}
                  baseUrl={SPECTRUM_COMPUTING_BASE_URL}
                />
              ))}
            </div>

            {/* Pagination */}
            {!searchInput && paginationInfo && paginationInfo.p > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-700">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                <span className="text-gray-300">
                  Page {currentPage} of {paginationInfo.p}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(paginationInfo.p, currentPage + 1))}
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
            {searchInput ? (
              <p>No games found matching: {searchInput}</p>
            ) : selectedLetter ? (
              <p>No games found for letter {selectedLetter === '_' ? '#' : selectedLetter}</p>
            ) : (
              <p>Select a letter to view games</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 