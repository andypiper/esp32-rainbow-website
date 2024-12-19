import { Game } from '../../types/game';
import { ensureBaseUrl } from '../../utils/urls';

interface Props {
  game: Game;
  formatFileSize: (bytes: number) => string;
  getFilenameFromUrl: (url: string) => string;
  onPlayFile?: (file: Game['f'][0]) => void;
}

function isPlayableFile(filename: string): boolean {
  return /\.(tap|tzx|z80)$/i.test(filename) || /\.(tap|tzx|z80)\.zip$/i.test(filename);
}

export default function FilesList({ game, formatFileSize, getFilenameFromUrl, onPlayFile }: Props) {
  return (
    <section id="files">
      <h2 className="text-xl font-semibold text-gray-100 mb-2">Download Files</h2>
      <div className="bg-gray-700 rounded-lg p-4">
        {game.f.length > 0 ? (
          <ul className="space-y-2" role="list">
            {game.f.map((file, index) => {
              const filename = getFilenameFromUrl(file.l);
              const canPlay = isPlayableFile(filename);

              return (
                <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-gray-300">{file.y}</span>
                    <span className="text-sm text-gray-400">{filename}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {file.s && (
                      <span className="text-gray-400">{formatFileSize(file.s)}</span>
                    )}
                    <div className="flex gap-2">
                      {canPlay && (
                        <>
                          <button
                            disabled
                            className="group relative px-3 py-1 bg-green-600 text-white rounded opacity-50 cursor-not-allowed"
                            aria-label={`Play ${file.y} version of ${game.t}`}
                          >
                            Play
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                              Coming soon!
                            </span>
                          </button>
                          <button
                            disabled
                            className="group relative px-3 py-1 bg-purple-600 text-white rounded opacity-50 cursor-not-allowed"
                            aria-label={`Send ${file.y} version of ${game.t} to device`}
                          >
                            Send to device
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
                              ESP32 Rainbow support coming soon!
                            </span>
                          </button>
                        </>
                      )}
                      <a
                        href={ensureBaseUrl(file.l)}
                        className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        aria-label={`Download ${file.y} version of ${game.t}`}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-300">No files available</p>
        )}
      </div>
    </section>
  );
} 