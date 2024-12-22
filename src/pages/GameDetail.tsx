import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ZXDBCredit from '../components/ZXDBCredit';
import StarRating from '../components/StarRating';
import { SpectrumScreen } from '../utils/SpectrumScreen';
import ImageGallery from '../components/game-detail/ImageGallery';
import FilesList from '../components/game-detail/FilesList';
import { Game } from '../types/game';
import { ensureBaseUrl, getFilenameFromUrl } from '../utils/urls';

function isScrFile(file: Game['f'][0]): boolean {
  return file.l.toLowerCase().endsWith('.scr');
}

function generateStructuredData(game: Game) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.t,
    "gameGenre": game.g,
    "gamePlatform": game.m,
    "offers": game.f.map(file => ({
      "@type": "Offer",
      "url": file.l,
      "fileFormat": file.y
    }))
  };
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrImages, setScrImages] = useState<Record<string, string>>({});

  // Handle back navigation
  const handleBack = () => {
    // Check if we can go back in history
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // If we can't go back or came directly to this page, construct a URL
      const letter = searchParams.get('letter');
      const page = searchParams.get('page');
      const search = searchParams.get('search');
      
      let url = '/games';
      const params = new URLSearchParams();
      
      if (letter) params.set('letter', letter);
      if (page) params.set('page', page);
      if (search) params.set('search', search);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      navigate(url);
    }
  };

  // Load and decode SCR files
  const loadScrFiles = async (game: Game) => {
    const scrFiles = game.f.filter(isScrFile);
    const screen = new SpectrumScreen();
    
    for (const file of scrFiles) {
      try {
        const url = ensureBaseUrl(file.l);
        await screen.loadFromUrl(url);
        setScrImages(prev => ({
          ...prev,
          [file.l]: screen.toDataURL()
        }));
      } catch (error) {
        console.error('Failed to load SCR file:', file.l, error);
      }
    }
  };

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
            l: file.l
          }))
        };

        setGame(processedGame);
        
        // Load SCR files
        await loadScrFiles(processedGame);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGame();
  }, [id]);

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

  const getDisplayUrl = (file: Game['f'][0]): string => {
    if (isScrFile(file)) {
      return scrImages[file.l] || ensureBaseUrl(file.l);
    }
    return ensureBaseUrl(file.l);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow p-8">
          <button onClick={handleBack} className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
            ← Back to Games
          </button>
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
            <button onClick={handleBack} className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
              ← Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${game.t} - ZX Spectrum Game`}</title>
        <meta name="description" content={`Download ${game.t} - a ${game.g} for ${game.m}. Free download with multiple format options including ${game.f.map(f => f.y).join(', ')}.`} />
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData(game))}
        </script>
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        <article className="bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <nav className="mb-4">
              <button onClick={handleBack} className="text-indigo-400 hover:text-indigo-300 inline-block">
                ← Back to Games
              </button>
            </nav>
            
            <div className="flex justify-between items-center mt-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-100">{game.t}</h1>
              {game.f.some(f => f.l.toLowerCase().match(/\.(scr|gif|png|jpg|jpeg)$/)) && (
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

            <section className="mb-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-400">Genre</dt>
                  <dd className="text-gray-100">{game.g}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Platform</dt>
                  <dd className="text-gray-100">{game.m}</dd>
                </div>
                {game.sc ? (
                  <div>
                    <dt className="text-gray-400">Score</dt>
                    <dd>
                      <StarRating score={game.sc} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
            
            <FilesList 
              game={game}
              formatFileSize={formatFileSize}
              getFilenameFromUrl={getFilenameFromUrl}
            />

            <ImageGallery 
              game={game}
              getDisplayUrl={getDisplayUrl}
              isScrFile={isScrFile}
            />
          </div>
          <ZXDBCredit />
        </article>
      </main>
    </>
  );
} 