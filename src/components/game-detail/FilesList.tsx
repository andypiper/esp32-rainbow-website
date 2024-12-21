import { useState, useEffect } from 'react';
import { Game } from '../../types/game';
import { ensureBaseUrl, getProxyUrl } from '../../utils/urls';

interface Props {
  game: Game;
  formatFileSize: (bytes: number) => string;
  getFilenameFromUrl: (url: string) => string;
}

type TabType = 'playable' | 'images' | 'other';

const PLAYABLE = ['tap.zip', 'tzx.zip', 'z80.zip'];
const SUPPORTED_NOW = ['tap.zip', 'tzx.zip'];

export default function FilesList({ game, formatFileSize, getFilenameFromUrl }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('playable');

  const isPlayableFile = (file: Game['f'][0]) => {
    return PLAYABLE.some(ext => file.l.endsWith(ext));
  };

  const isSupportedNow = (file: Game['f'][0]) => {
    return SUPPORTED_NOW.some(ext => file.l.endsWith(ext));
  };

  const isImageFile = (file: Game['f'][0]) => {
    const ext = getFilenameFromUrl(file.l).split('.').pop()?.toLowerCase();
    return ext === 'scr' || ext === 'gif' || ext === 'png' || ext === 'jpg' || ext === 'jpeg';
  };

  const getEmulatorUrl = (file: Game['f'][0]) => {
    const proxyUrl = getProxyUrl(file.l);
    return `/emulator?file=${encodeURIComponent(proxyUrl)}&title=${encodeURIComponent(game.t)}`;
  };

  const playableFiles = game.f.filter(isPlayableFile);
  const imageFiles = game.f.filter(isImageFile);
  const otherFiles = game.f.filter(f => !isPlayableFile(f) && !isImageFile(f));

  useEffect(() => {
    if (playableFiles.length > 0) {
      setActiveTab('playable');
    } else if (imageFiles.length > 0) {
      setActiveTab('images');
    } else if (otherFiles.length > 0) {
      setActiveTab('other');
    }
  }, []);

  const currentFiles = {
    playable: playableFiles,
    images: imageFiles,
    other: otherFiles,
  }[activeTab];

  const tabs = [
    { id: 'playable', label: 'Playable', count: playableFiles.length },
    { id: 'images', label: 'Images', count: imageFiles.length },
    { id: 'other', label: 'Other Files', count: otherFiles.length },
  ].filter(tab => tab.count > 0);

  if (tabs.length === 0) return null;

  return (
    <section id="files" className="mt-8">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Files</h2>
      
      {/* Entire file list container with background */}
      <div className="bg-gray-850 rounded-lg p-4">
        {/* Tabs */}
        <div>
          <nav className="flex" aria-label="Files">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-4 py-2 text-sm transition-colors relative rounded-bl-none rounded-br-none
                  ${activeTab === tab.id
                    ? 'bg-gray-900 text-gray-100 font-medium'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-850 hover:text-gray-300'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>

          {/* File List */}
          <div className="bg-gray-900 rounded-lg rounded-tl-none overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-2 text-left text-gray-200">Filename</th>
                  <th className="px-4 py-2 text-left text-gray-200">Type</th>
                  <th className="px-4 py-2 text-left text-gray-200">Size</th>
                  <th className="px-4 py-2 text-right text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {currentFiles.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-750">
                    <td className="px-4 py-2 text-gray-300">
                      {getFilenameFromUrl(file.l)}
                    </td>
                    <td className="px-4 py-2 text-gray-300">{file.y}</td>
                    <td className="px-4 py-2 text-gray-300">
                      {formatFileSize(file.s || 0)}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <a
                        href={ensureBaseUrl(file.l)}
                        className="inline-block px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                      {isPlayableFile(file) && isSupportedNow(file) && (
                        <a
                          href={getEmulatorUrl(file)}
                          className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Opens in a new tab"
                        >
                          Play
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
} 