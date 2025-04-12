import { useState, useEffect } from 'react';
import { Game } from '../../types/game';
import { ensureBaseUrl, getProxyUrl } from '../../utils/urls';
import { sendFileToDevice } from '../../utils/deviceFileTransfer';

interface Props {
  game: Game;
  formatFileSize: (bytes: number) => string;
  getFilenameFromUrl: (url: string) => string;
}

type TabType = 'playable' | 'images' | 'other';

const PLAYABLE = ['tap.zip', 'tzx.zip', 'z80.zip', 'sna.zip'];
const SUPPORTED_NOW = ['tap.zip', 'tzx.zip', 'z80.zip', 'sna.zip'];

export default function FilesList({ game, formatFileSize, getFilenameFromUrl }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('playable');
  const [transferInProgress, setTransferInProgress] = useState<boolean>(false);
  const [transferFileName, setTransferFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Determine machine type based on game metadata
  const machineType = game.m === 'ZX-Spectrum 48K' ? '48k' : '128k';

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
    return `/emulator?file=${encodeURIComponent(proxyUrl)}&title=${encodeURIComponent(game.t)}&machine=${machineType}`;
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
  }, [playableFiles.length, imageFiles.length, otherFiles.length]);

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

  // New function to handle sending file to device
  const handleSendToDevice = async (file: Game['f'][0]) => {
    const fileUrl = getProxyUrl(ensureBaseUrl(file.l));
    const fileName = getFilenameFromUrl(file.l);
    
    // Set global transfer in progress state
    setTransferInProgress(true);
    setTransferFileName(fileName);
    
    try {
      const result = await sendFileToDevice(fileUrl, machineType);
      setStatusMessage({ text: result, type: 'success' });
    } catch (error) {
      setStatusMessage({ 
        text: error instanceof Error ? error.message : 'Failed to send file to device', 
        type: 'error' 
      });
    } finally {
      setTransferInProgress(false);
      setTransferFileName(null);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  if (tabs.length === 0) return null;

  return (
    <section id="files" className="mt-8">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Files</h2>
      
      {/* Status message */}
      {statusMessage && (
        <div className={`p-3 mb-4 rounded ${
          statusMessage.type === 'success' ? 'bg-green-700' : 'bg-red-700'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
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
            {/* Hide table on mobile, show cards instead */}
            <div className="hidden md:block">
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
                          <>
                            <a
                              href={getEmulatorUrl(file)}
                              className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Opens in a new tab"
                            >
                              Play
                            </a>
                            <button
                              onClick={() => handleSendToDevice(file)}
                              disabled={transferInProgress}
                              className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                              title={transferInProgress ? 'Transfer in progress' : 'Send to connected device'}
                            >
                              {transferFileName === getFilenameFromUrl(file.l) ? 'Sending...' : 'Send to Device'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden">
              {currentFiles.map((file, index) => (
                <div key={index} className="p-4 border-b border-gray-800">
                  <div className="mb-2">
                    <div className="text-gray-300 font-medium break-all">
                      {getFilenameFromUrl(file.l)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {file.y} • {formatFileSize(file.s || 0)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={ensureBaseUrl(file.l)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 transition-colors text-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                    {isPlayableFile(file) && isSupportedNow(file) && (
                      <>
                        <a
                          href={getEmulatorUrl(file)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-500 transition-colors text-center"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Opens in a new tab"
                        >
                          Play
                        </a>
                        <button
                          onClick={() => handleSendToDevice(file)}
                          disabled={transferInProgress}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-500 transition-colors text-center disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                          {transferFileName === getFilenameFromUrl(file.l) ? 'Sending...' : 'Send to Device'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 