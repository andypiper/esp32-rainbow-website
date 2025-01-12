import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpectrumScreen } from '../utils/SpectrumScreen';
import StarRating from './StarRating';
import { ensureBaseUrl } from '../utils/urls';

interface Game {
  i: number;  // id
  t: string;  // title
  g: string;  // genre
  m: string;  // machine
  sc: number; // score
  f: {        // files
    l: string;  // link
    y: string;  // type
    s: number | null;  // size (can be null)
  }[];
}

interface GameTileProps {
  game: Game;
  selectedLetter?: string | null;
  currentPage?: number;
  searchInput?: string;
  onGameClick?: () => void;
  baseUrl?: string;
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

export default function GameTile({ 
  game, 
  selectedLetter, 
  currentPage, 
  searchInput, 
  onGameClick,
}: GameTileProps) {
  const [screenUrl, setScreenUrl] = useState<string | null>(null);

  // Fetch and process the screen URL when the game changes
  useEffect(() => {
    getRunningScreenUrl(game.f).then(url => setScreenUrl(url));
  }, [game]);

  return (
    <Link
      key={game.i}
      onClick={onGameClick}
      to={`/games/${game.i}`}
      className={`block rounded-lg p-4 transition-transform hover:scale-105 relative overflow-hidden h-full group ${
        screenUrl ? 'hover:shadow-xl' : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {screenUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110"
            style={{ 
              backgroundImage: `url(${screenUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: screenUrl.includes('data:image/png;base64') ? 'pixelated' : 'auto'
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"
          />
        </>
      )}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <h3 className="text-lg font-semibold text-gray-100 mb-2 truncate" title={game.t}>
          {game.t}
        </h3>
        <div className="text-gray-300 text-sm">
          <p className="truncate">Genre: {game.g}</p>
          <p className="truncate">Machine: {game.m}</p>
          {game.sc ? (
            <p className="mt-1">
              <StarRating score={game.sc} />
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
} 