import { useState, useEffect } from 'react';
import Device from '../device/Device';
import FileBrowser from '../components/FileBrowser';

function DeviceTest() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [folderPath, setFolderPath] = useState('/');
  const [version, setVersion] = useState<string | null>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [writeResult, setWriteResult] = useState<string | null>(null);
  const [readFilePath, setReadFilePath] = useState('');
  const [readFileContent, setReadFileContent] = useState<string | null>(null);

  useEffect(() => {
    // Check if Web Serial API is supported
    setIsSupported('serial' in navigator);
    
    // Initialize device if supported
    if ('serial' in navigator) {
      const newDevice = new Device();
      setDevice(newDevice);

      // Cleanup on unmount
      return () => {
        if (newDevice.isConnected()) {
          newDevice.disconnect().catch(console.error);
        }
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!device) return;
    
    try {
      setError(null);
      await device.connect();
      setIsConnected(true);
      console.log('Connected to device successfully');
      // After connecting, automatically list the root directory
      handleListFolder(folderPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection error: ${errorMessage}`);
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    if (!device) return;
    
    try {
      await device.disconnect();
      setIsConnected(false);
      setVersion(null);
      setFileList([]);
      console.log('Disconnected from device');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Disconnect error: ${errorMessage}`);
      console.error('Disconnect error:', err);
    }
  };

  const handleGetVersion = async () => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      const versionStr = await device.getVersion();
      setVersion(versionStr);
      console.log('Device version:', versionStr);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to get version: ${errorMessage}`);
      console.error('Failed to get version:', err);
    }
  };

  const handleListFolder = async (path: string = folderPath) => {
    if (!device || !isConnected) return;
    console.log('Listing folder', path);
    try {
      setError(null);
      setIsLoading(true);
      const files = await device.listFolder(path);
      setFileList(files);
      setFolderPath(path);
      console.log('Files in', path + ':', files);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`List folder error: ${errorMessage}`);
      console.error('List folder error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    // If path doesn't end with /, add it (except for root which is just /)
    const formattedPath = path === '/' ? path : path.endsWith('/') ? path : path + '/';
    handleListFolder(formattedPath);
  };

  const handleWriteFile = async () => {
    if (!device || !isConnected || !fileName) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Convert the string content to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(fileContent);
      
      // Write the file - if path doesn't start with /, prepend current folder
      const fullPath = fileName.startsWith('/') ? fileName : `${folderPath}${fileName}`;
      const result = await device.writeFile(fullPath, data);
      
      setWriteResult(result);
      console.log('Write file result:', result);
      
      // Refresh the file list to show the new file
      // handleListFolder(folderPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Write file error: ${errorMessage}`);
      console.error('Write file error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadFile = async () => {
    if (!device || !isConnected || !readFilePath) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Read the file
      const data = await device.readFile(readFilePath);
      
      // Convert the Uint8Array to a string
      const decoder = new TextDecoder();
      const content = decoder.decode(data);
      
      setReadFileContent(content);
      console.log('Read file content:', content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Read file error: ${errorMessage}`);
      console.error('Read file error:', err);
      setReadFileContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Device Test Page</h1>
      
      {!isSupported && (
        <div className="p-4 mb-6 bg-yellow-900 text-white rounded">
          <p className="font-bold">Browser Compatibility Warning</p>
          <p>The Web Serial API is only supported in Chrome and Edge browsers (version 89 or later). Please switch to a compatible browser to use this feature.</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Connection</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleConnect}
            disabled={isConnected || !isSupported}
            className={`px-4 py-2 rounded ${isConnected || !isSupported 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'}`}
          >
            Connect
          </button>
          
          <button
            onClick={handleDisconnect}
            disabled={!isConnected || !isSupported}
            className={`px-4 py-2 rounded ${!isConnected || !isSupported 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'}`}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-900 text-white rounded">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Firmware Version</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGetVersion}
            disabled={!isConnected || !isSupported}
            className={`px-4 py-2 rounded ${!isConnected || !isSupported 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Get Version
          </button>
          
          {version && (
            <div className="px-4 py-2 bg-gray-800 rounded">
              <span className="font-medium">Version: </span>
              <span>{version}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">File Browser</h2>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            value={folderPath}
            onChange={e => setFolderPath(e.target.value)}
            className="px-4 py-2 text-black rounded flex-grow"
            placeholder="Folder path"
            disabled={!isSupported || !isConnected}
          />
          
          <button
            onClick={() => handleListFolder()}
            disabled={!isConnected || !isSupported}
            className={`px-4 py-2 rounded ${!isConnected || !isSupported 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Refresh
          </button>
        </div>
        
        {isConnected && (
          <FileBrowser 
            files={fileList} 
            currentPath={folderPath}
            onNavigate={handleNavigate}
            isLoading={isLoading}
          />
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Write File</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="fileName" className="block mb-1">File Name:</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              className="px-4 py-2 text-black rounded w-full"
              placeholder="example.txt or /path/to/file.txt"
              disabled={!isConnected || !isSupported}
            />
          </div>
          
          <div>
            <label htmlFor="fileContent" className="block mb-1">File Content:</label>
            <textarea
              id="fileContent"
              value={fileContent}
              onChange={e => setFileContent(e.target.value)}
              className="px-4 py-2 text-black rounded w-full min-h-[200px]"
              placeholder="Enter file content here..."
              disabled={!isConnected || !isSupported}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleWriteFile}
              disabled={!isConnected || !isSupported || !fileName}
              className={`px-4 py-2 rounded ${!isConnected || !isSupported || !fileName
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'}`}
            >
              Write File
            </button>
            
            {writeResult && (
              <div className="px-4 py-2 bg-gray-800 rounded">
                <span className="font-medium">Result: </span>
                <span>{writeResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Read File</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="readFilePath" className="block mb-1">File Path:</label>
            <input
              id="readFilePath"
              type="text"
              value={readFilePath}
              onChange={e => setReadFilePath(e.target.value)}
              className="px-4 py-2 text-black rounded w-full"
              placeholder="/path/to/file.txt"
              disabled={!isConnected || !isSupported}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleReadFile}
              disabled={!isConnected || !isSupported || !readFilePath}
              className={`px-4 py-2 rounded ${!isConnected || !isSupported || !readFilePath
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Read File
            </button>
          </div>
          
          {readFileContent !== null && (
            <div>
              <label className="block mb-1">File Content:</label>
              <div className="p-4 bg-gray-800 rounded overflow-auto max-h-[400px] whitespace-pre-wrap">
                {readFileContent}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Console Output</h2>
        <p>Check the browser console (F12) for detailed output</p>
      </div>
    </div>
  );
}

export default DeviceTest; 