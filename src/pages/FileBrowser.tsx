import { useState, useEffect, useCallback } from 'react';
import useDevice from '../context/useDevice';
import FileBrowser from '../components/FileBrowser';
import FileUploader from '../components/FileUploader';
import { FileInfo } from '../device/Messages/ResponseTypes';

const ROOT_PATH = '/';

export default function FileBrowserPage() {
  const { device, isConnected, connect, versionInfo, getVersion } = useDevice();
  const [activeTab, setActiveTab] = useState<'flash' | 'sd'>('flash');
  const [flashFiles, setFlashFiles] = useState<FileInfo[]>([]);
  const [sdFiles, setSdFiles] = useState<FileInfo[]>([]);
  const [flashPath, setFlashPath] = useState(ROOT_PATH);
  const [sdPath, setSdPath] = useState(ROOT_PATH);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedVersion, setCheckedVersion] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [uploaderFiles, setUploaderFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Fetch version info on mount if not already available
  useEffect(() => {
    if (isConnected && !versionInfo && !checkedVersion) {
      setCheckedVersion(true);
      getVersion().catch(() => {});
    }
  }, [isConnected, versionInfo, getVersion, checkedVersion]);

  // Unified fetchFiles callback
  const fetchFiles = useCallback(async (isFlash: boolean) => {
    if (!isConnected || !versionInfo) return;
    if (isFlash && !versionInfo.flash.available) return;
    if (!isFlash && !versionInfo.sd.available) return;
    setError(null);
    setIsLoading(true);
    try {
      if (isFlash) {
        const files = await device.listFolder(flashPath, true);
        setFlashFiles(files);
      } else {
        const files = await device.listFolder(sdPath, false);
        setSdFiles(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, versionInfo, device, flashPath, sdPath]);

  // Fetch files when path or tab changes
  useEffect(() => {
    fetchFiles(activeTab === 'flash');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, flashPath, sdPath, isConnected, versionInfo]);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    if (activeTab === 'flash') {
      setFlashPath(path);
    } else {
      setSdPath(path);
    }
  };

  // File actions
  const handleDelete = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await device.deleteFile(path, activeTab === 'flash');
      fetchFiles(activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (oldPath: string, newPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await device.renameFile(oldPath, newPath, activeTab === 'flash');
      fetchFiles(activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDirectory = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await device.makeDirectory(path, activeTab === 'flash');
      fetchFiles(activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFileInfo = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await device.getFileInfo(path, activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (path: string): Promise<Uint8Array> => {
    setIsLoading(true);
    setError(null);
    try {
      return await device.readFile(path, activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return new Uint8Array();
    } finally {
      setIsLoading(false);
    }
  };

  // Upload multiple files in sequence, update progress, and refresh once at the end
  const handleUpload = async (
    files: { fullPath: string; data: Uint8Array }[],
    onProgress?: (progress: number) => void
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const { fullPath, data } = files[i];
        await device.writeFile(fullPath, data, activeTab === 'flash', (progress) => {
          if (onProgress) {
            // Progress is per file, so scale to overall progress
            const overall = ((i + progress / 100) / files.length) * 100;
            onProgress(overall);
          }
        });
      }
      fetchFiles(activeTab === 'flash');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file drop anywhere in the file browser area
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setUploaderFiles(droppedFiles);
      setUploaderOpen(true);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  // UI
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">ESP32 Rainbow File Browser</h2>
        <p className="mb-4">Connect your ESP32 Rainbow device to browse files on Flash and SD Card.</p>
        <button
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold"
          onClick={() => connect()}
        >
          Connect Device
        </button>
      </div>
    );
  }

  if (!versionInfo) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow text-center">
        <span>Loading device information...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">ESP32 Rainbow File Browser</h2>
      <div className="mb-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'flash' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('flash')}
          disabled={!versionInfo.flash.available}
        >
          Flash Storage
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'sd' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('sd')}
          disabled={!versionInfo.sd.available}
        >
          SD Card
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-white rounded">{error}</div>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative"
        style={{ minHeight: 100 }}
      >
        {isDragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-900 bg-opacity-80 pointer-events-none rounded-lg border-4 border-dashed border-indigo-400">
            <span className="text-2xl text-indigo-100 font-bold">Drop files to upload</span>
          </div>
        )}
        {activeTab === 'flash' && versionInfo.flash.available && (
          <>
            <FileUploader
              currentPath={flashPath}
              onUpload={handleUpload}
              isLoading={isLoading}
              show={uploaderOpen}
              initialFiles={uploaderFiles}
              onClose={() => { setUploaderOpen(false); setUploaderFiles([]); fetchFiles(true); }}
            />
            <FileBrowser
              files={flashFiles}
              currentPath={flashPath}
              onNavigate={handleNavigate}
              isLoading={isLoading}
              onDelete={handleDelete}
              onRename={handleRename}
              onCreateDirectory={handleCreateDirectory}
              onGetFileInfo={handleGetFileInfo}
              onDownloadFile={handleDownloadFile}
            />
          </>
        )}
        {activeTab === 'sd' && versionInfo.sd.available && (
          <>
            <FileUploader
              currentPath={sdPath}
              onUpload={handleUpload}
              isLoading={isLoading}
              show={uploaderOpen}
              initialFiles={uploaderFiles}
              onClose={() => { setUploaderOpen(false); setUploaderFiles([]); fetchFiles(false); }}
            />
            <FileBrowser
              files={sdFiles}
              currentPath={sdPath}
              onNavigate={handleNavigate}
              isLoading={isLoading}
              onDelete={handleDelete}
              onRename={handleRename}
              onCreateDirectory={handleCreateDirectory}
              onGetFileInfo={handleGetFileInfo}
              onDownloadFile={handleDownloadFile}
            />
          </>
        )}
      </div>
      {((activeTab === 'flash' && !versionInfo.flash.available) || (activeTab === 'sd' && !versionInfo.sd.available)) && (
        <div className="p-4 bg-gray-700 rounded text-center text-gray-300">
          {activeTab === 'flash' ? 'Flash storage is not available on this device.' : 'SD card is not available or not inserted.'}
        </div>
      )}
    </div>
  );
} 