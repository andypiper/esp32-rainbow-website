import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import FlexSearch from 'flexsearch';
import ZXDBCredit from '../components/ZXDBCredit';
import GameTile from '../components/GameTile';
import { ensureBaseUrl } from '../utils/urls';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('');
const ITEMS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 500;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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
async function fetchWithCache<T>(
  url: string, 
  cacheName: string = 'games-cache',
  signal?: AbortSignal
): Promise<T> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    const data = await cachedResponse.json();
    const cacheTimestamp = parseInt(cachedResponse.headers.get('cache-timestamp') || '0');
    
    if (Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
      return data;
    }
  }

  // Pass the signal to fetch
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  
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

// Add this function before the Games component
async function findGameLocation(id: number): Promise<{ letter: string; page: number } | null> {
  try {
    const indexData = await fetchWithCache<IndexEntry[]>('/data/index.json');
    const entry = indexData.find(entry => entry.i === id);
    if (entry) {
      return {
        letter: entry.l,
        page: entry.p
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding game location:', error);
    return null;
  }
}

export default function Games() {
  const { letter, id } = useParams<{ letter?: string; id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<IndexEntry[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchIndex = useRef<FlexSearch.Index | null>(null);
  const indexData = useRef<IndexEntry[]>([]);
  const currentFetchController = useRef<AbortController | null>(null);
  const navigate = useNavigate();

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
    navigate(`/games/letter/${letter || 'A'}?page=1`);
    setSearchInput(''); // Clear search input
    setSearchResults([]); // Clear search results
  };

  // Update URL when page changes
  const handlePageChange = (newPage: number) => {
    if (!letter) return;
    navigate(`/games/letter/${letter}?page=${newPage}`);
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
      if (letter) {
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
      if (!letter) {
        setGames([]);
        setPaginationInfo(null);
        return;
      }

      const isNumber = !isNaN(parseInt(letter));

      // handle the legacy id instead of letter
      if (isNumber) {
        navigate(`/games/${letter}`);
        return;
      }      

      setIsLoading(true);
      setError(null);

      try {
        // Fetch pagination info with caching
        const info = await fetchWithCache<PaginationInfo>(`/data/${letter}/info.json`);
        setPaginationInfo(info);

        // Fetch games for current page with caching
        const gamesData = await fetchWithCache<Game[]>(`/data/${letter}/${currentPage}.json`);
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
  }, [letter, currentPage, searchInput]);

  // Fetch full game details for search results
  useEffect(() => {
    async function fetchSearchResultDetails() {
      if (!searchResults.length) return;

      // Cancel any ongoing requests
      if (currentFetchController.current) {
        currentFetchController.current.abort();
      }
      // Create new controller for this request
      currentFetchController.current = new AbortController();

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
            const pageGames = await fetchWithCache<Game[]>(
              `/data/${letter}/${page}.json`,
              'games-cache',
              currentFetchController.current.signal
            );
            
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
        // Only set error if it's not an abort error
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
        setGames([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchResults.length) {
      fetchSearchResultDetails();
    }

    // Cleanup function to abort any pending requests when component unmounts
    // or when searchResults changes
    return () => {
      if (currentFetchController.current) {
        currentFetchController.current.abort();
      }
    };
  }, [searchResults]);

  // Function to save scroll position
  const handleGameClick = () => {
    const scrollPosition = window.scrollY;
    sessionStorage.setItem('gamesListScrollPosition', scrollPosition.toString());
  };

  // Update where selectedLetter is used to use letter from params instead
  const selectedLetter = letter;

  // Add effect to handle legacy ID-based URLs
  useEffect(() => {
    async function handleLegacyUrl() {
      if (id) {
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          // Since we're already at /games/:id, we don't need to redirect
          // Just need to handle invalid IDs
          const location = await findGameLocation(numericId);
          if (!location) {
            // If game not found, redirect to games list
            navigate('/games/letter/A?page=1');
          }
          // If the game exists, we're already on the correct URL
        } else {
          // Invalid ID format, redirect to games list
          navigate('/games/letter/A?page=1');
        }
      }
    }

    handleLegacyUrl();
  }, [id, navigate]);

  // Update the initial navigation effect
  useEffect(() => {
    // If we're on /games with no letter and not searching, redirect to /games/letter/A
    if (!letter && !searchInput && location.pathname === '/games') {
      navigate('/games/letter/A?page=1');
    }
  }, [letter, searchInput, location.pathname, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-gray-100">Play ZX Spectrum Games Online</h1>
      
      {/* New SEO-friendly introduction */}
      <div className="prose prose-invert max-w-none mb-8">
        <p className="text-lg text-gray-300 mb-4">
          Welcome to our collection of classic ZX Spectrum games that you can play directly in your web browser! 
          This comprehensive library features thousands of titles from the iconic 8-bit home computer that 
          revolutionized gaming in the 1980s.
        </p>
        <p className="text-gray-400 mb-8">
          Our collection is powered by the ZXDB database, the most extensive archive of ZX Spectrum software, 
          featuring everything from classic arcade games and text adventures to educational software and 
          programming tools. Browse through our catalog alphabetically or use the search function to find 
          your favorite retro games. Each game can be played instantly online without needing to download 
          or install any software.
        </p>
      </div>

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
                <div key={game.i} className="aspect-[4/3]">
                  <GameTile
                    game={game}
                    selectedLetter={selectedLetter}
                    currentPage={currentPage}
                    searchInput={searchInput}
                    onGameClick={handleGameClick}
                  />
                </div>
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
      <ZXDBCredit />
      </div>
    </div>
  );
} 