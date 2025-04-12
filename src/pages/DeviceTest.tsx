import { useState, useEffect } from 'react';
import Device from '../device/Device';
import FileBrowser from '../components/FileBrowser';
import FileEditor from '../components/FileEditor';
import FileUploader from '../components/FileUploader';
import { FileInfo } from '../device/Messages/ResponseTypes';

function DeviceTest() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [folderPath, setFolderPath] = useState('/');
  const [version, setVersion] = useState<string | null>(null);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // File editor state
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingFile, setIsViewingFile] = useState(false);

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

  const handleDeleteFile = async (path: string) => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const result = await device.deleteFile(path);
      console.log('Delete file result:', result);
      
      if (result !== 'OK') {
        throw new Error(`Failed to delete file: ${result}`);
      }
      
      // Refresh the file list
      handleListFolder(folderPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Delete file error: ${errorMessage}`);
      console.error('Delete file error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async (oldPath: string, newPath: string) => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const result = await device.renameFile(oldPath, newPath);
      console.log('Rename file result:', result);
      
      if (result !== 'OK') {
        throw new Error(`Failed to rename file: ${result}`);
      }
      
      // Refresh the file list
      handleListFolder(folderPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Rename file error: ${errorMessage}`);
      console.error('Rename file error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDirectory = async (path: string) => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const result = await device.makeDirectory(path);
      console.log('Create directory result:', result);
      
      if (result !== 'OK') {
        throw new Error(`Failed to create directory: ${result}`);
      }
      
      // Refresh the file list
      handleListFolder(folderPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Create directory error: ${errorMessage}`);
      console.error('Create directory error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFileInfo = async (path: string) => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const fileInfo = await device.getFileInfo(path);
      console.log('File info:', fileInfo);
      return fileInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Get file info error: ${errorMessage}`);
      console.error('Get file info error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = async (path: string) => {
    if (!device || !isConnected) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if it's a text file that can be edited
      const fileInfo = await device.getFileInfo(path);
      
      if (fileInfo.isDirectory) {
        // If it's a directory, navigate into it
        handleNavigate(path);
        return;
      }
      
      // Read the file content
      const data = await device.readFile(path);
      
      // Convert the Uint8Array to string
      const decoder = new TextDecoder();
      const content = decoder.decode(data);
      
      // Set up the file editor
      setSelectedFilePath(path);
      setFileContent(content);
      
      // Determine if the file should be editable based on extension
      const isTextFile = /\.(txt|html|css|js|json|md|xml|log|ini|conf|py|sh|c|cpp|h|yaml|yml)$/i.test(path);
      setIsEditing(isTextFile);
      setIsViewingFile(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to read file: ${errorMessage}`);
      console.error('Failed to read file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = async (content: string) => {
    if (!device || !isConnected || !selectedFilePath) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      
      // Write the file
      const result = await device.writeFile(selectedFilePath, data);
      console.log('Write file result:', result);
      
      if (result !== 'OK') {
        throw new Error(`Failed to save file: ${result}`);
      }
      
      // Update the local content state
      setFileContent(content);
      
      // Refresh the file list if needed
      handleListFolder(folderPath);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to save file: ${errorMessage}`);
      console.error('Failed to save file:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEditor = () => {
    setIsViewingFile(false);
    setSelectedFilePath(null);
    setFileContent('');
  };

  const handleDownloadFile = async (path: string): Promise<Uint8Array> => {
    if (!device || !isConnected) {
      throw new Error('Not connected to device');
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Read the file data using the existing ReadFile message
      const fileData = await device.readFile(path);
      console.log(`Downloaded file ${path}, size: ${fileData.length} bytes`);
      
      return fileData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Download error: ${errorMessage}`);
      console.error('Download error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (path: string, data: Uint8Array): Promise<string> => {
    if (!device || !isConnected) {
      throw new Error('Not connected to device');
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Write the file using the existing WriteFile message
      const result = await device.writeFile(path, data);
      console.log(`Uploaded file ${path}, size: ${data.length} bytes, result: ${result}`);
      
      // Refresh the file list to show the new file
      await handleListFolder(folderPath);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Upload error: ${errorMessage}`);
      console.error('Upload error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ESP32 File Browser</h1>
      
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
            <div className="px-4 py-2 bg-gray-800 rounded flex items-center">
              <span className="font-medium mr-1">Version:</span>
              <span>{version}</span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-900 text-white rounded">
          <p>{error}</p>
          <button 
            className="mt-2 px-2 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {isConnected && (
        <div className="grid grid-cols-1 gap-6">
          {isViewingFile && selectedFilePath ? (
            <div className="bg-gray-800 p-4 rounded">
              <FileEditor
                filename={selectedFilePath.split('/').pop() || ''}
                content={fileContent}
                onSave={handleSaveFile}
                onCancel={handleCloseEditor}
                readOnly={!isEditing}
              />
            </div>
          ) : (
            <div>
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
              
              <FileUploader
                currentPath={folderPath}
                onUpload={handleUploadFile}
                isLoading={isLoading}
              />
              
              <FileBrowser 
                files={fileList} 
                currentPath={folderPath}
                onNavigate={handleNavigate}
                isLoading={isLoading}
                onDelete={handleDeleteFile}
                onRename={handleRenameFile}
                onCreateDirectory={handleCreateDirectory}
                onGetFileInfo={handleGetFileInfo}
                onSelectFile={handleSelectFile}
                onDownloadFile={handleDownloadFile}
              />
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 bg-gray-800 rounded mt-6">
        <h2 className="text-xl font-semibold mb-2">Console Output</h2>
        <p>Check the browser console (F12) for detailed output</p>
      </div>
    </div>
  );
}

export default DeviceTest; 