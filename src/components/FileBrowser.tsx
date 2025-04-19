import { useState } from 'react';
import { FileInfo } from '../device/Messages/ResponseTypes';

type FileBrowserProps = {
  files: FileInfo[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoading?: boolean;
  onDelete?: (path: string) => Promise<void>;
  onRename?: (oldPath: string, newPath: string) => Promise<void>;
  onCreateDirectory?: (path: string) => Promise<void>;
  onGetFileInfo?: (path: string) => Promise<FileInfo | undefined>;
  onSelectFile?: (path: string) => void;
  onDownloadFile?: (path: string) => Promise<Uint8Array>;
}

const FileBrowser = ({ 
  files, 
  currentPath, 
  onNavigate, 
  isLoading = false,
  onDelete,
  onRename,
  onCreateDirectory,
  onGetFileInfo,
  onSelectFile,
  onDownloadFile
}: FileBrowserProps) => {
  // Separate directories from files
  const directories = files.filter(file => file.isDirectory);
  const regularFiles = files.filter(file => !file.isDirectory);

  // Sort alphabetically
  const sortedDirectories = directories.sort((a, b) => a.name.localeCompare(b.name));
  const sortedFiles = regularFiles.sort((a, b) => a.name.localeCompare(b.name));

  // State for UI operations
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isViewingInfo, setIsViewingInfo] = useState(false);

  // Navigate to parent directory
  const navigateToParent = () => {
    // Remove trailing slash if it exists
    const pathWithoutTrailingSlash = currentPath.endsWith('/') && currentPath !== '/' 
      ? currentPath.slice(0, -1) 
      : currentPath;
    
    // Find the last slash in the path
    const lastSlashIndex = pathWithoutTrailingSlash.lastIndexOf('/');
    
    // If there's no slash or it's the root, navigate to root
    if (lastSlashIndex <= 0) {
      onNavigate('/');
    } else {
      // Navigate to the parent directory
      onNavigate(pathWithoutTrailingSlash.substring(0, lastSlashIndex + 1));
    }
  };

  // Handle file selection
  const handleSelectFile = (file: FileInfo) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    
    if (onSelectFile) {
      onSelectFile(currentPath + file.name);
    }
  };

  // Handle directory selection
  const handleSelectDirectory = (directory: FileInfo) => {
    onNavigate(currentPath + directory.name + '/');
  };

  // Handle creating a new directory
  const handleCreateDirectory = async () => {
    if (!onCreateDirectory || !newDirectoryName) return;
    
    try {
      setError(null);
      const dirPath = currentPath + newDirectoryName;
      await onCreateDirectory(dirPath);
      setNewDirectoryName('');
      setIsCreatingDirectory(false);
    } catch (err) {
      setError(`Failed to create directory: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle deleting a file or directory
  const handleDelete = async (file: FileInfo) => {
    if (!onDelete) return;
    
    try {
      setError(null);
      const fullPath = currentPath + file.name + (file.isDirectory ? '/' : '');
      const confirmed = window.confirm(`Are you sure you want to delete ${fullPath}?`);
      
      if (confirmed) {
        await onDelete(fullPath);
        setSelectedFile(null);
      }
    } catch (err) {
      setError(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle renaming a file or directory
  const handleRename = async () => {
    if (!onRename || !selectedFile || !newFileName) return;
    
    try {
      setError(null);
      const oldPath = currentPath + selectedFile.name + (selectedFile.isDirectory ? '/' : '');
      const newPath = currentPath + newFileName + (selectedFile.isDirectory ? '/' : '');
      await onRename(oldPath, newPath);
      setIsRenaming(false);
      setSelectedFile(null);
    } catch (err) {
      setError(`Failed to rename: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle getting file info
  const handleGetInfo = async (file: FileInfo) => {
    if (!onGetFileInfo) return;
    
    try {
      setError(null);
      const fullPath = currentPath + file.name + (file.isDirectory ? '/' : '');
      const info = await onGetFileInfo(fullPath);
      if (info) {
        setFileInfo(info);
        setIsViewingInfo(true);
      } else {
        setError('No file information received');
      }
    } catch (err) {
      setError(`Failed to get file info: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle downloading a file
  const handleDownload = async (file: FileInfo) => {
    if (!onDownloadFile) return;
    
    try {
      setError(null);
      const fullPath = currentPath + file.name;
      
      // Get the file data
      const fileData = await onDownloadFile(fullPath);
      
      // Create a blob from the file data
      const blob = new Blob([fileData]);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (err) {
      setError(`Failed to download file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium mr-2">Files in: </h3>
        <div className="px-3 py-1 bg-gray-800 rounded flex-grow">
          {currentPath}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900 text-white rounded mb-3">
          {error}
          <button 
            className="ml-2 text-sm underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex mb-3 flex-wrap">
        <button
          onClick={navigateToParent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mr-2 mb-2"
          disabled={currentPath === '/' || isLoading}
        >
          Parent Directory
        </button>

        {onCreateDirectory && (
          <>
            <button
              onClick={() => setIsCreatingDirectory(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded mr-2 mb-2"
              disabled={isLoading}
            >
              New Directory
            </button>
          </>
        )}
      </div>

      {isCreatingDirectory && (
        <div className="p-4 bg-gray-700 rounded mb-3">
          <h4 className="text-lg mb-2">Create New Directory</h4>
          <div className="flex mb-2">
            <input
              type="text"
              value={newDirectoryName}
              onChange={(e) => setNewDirectoryName(e.target.value)}
              className="px-3 py-2 text-black rounded-l flex-grow"
              placeholder="Directory name"
            />
            <button
              onClick={handleCreateDirectory}
              disabled={!newDirectoryName}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-r"
            >
              Create
            </button>
          </div>
          <button
            onClick={() => setIsCreatingDirectory(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {isRenaming && selectedFile && (
        <div className="p-4 bg-gray-700 rounded mb-3">
          <h4 className="text-lg mb-2">Rename {selectedFile.name}</h4>
          <div className="flex mb-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="px-3 py-2 text-black rounded-l flex-grow"
            />
            <button
              onClick={handleRename}
              disabled={!newFileName}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r"
            >
              Rename
            </button>
          </div>
          <button
            onClick={() => setIsRenaming(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {isViewingInfo && fileInfo && (
        <div className="p-4 bg-gray-700 rounded mb-3">
          <h4 className="text-lg mb-2">File Information</h4>
          <div className="mb-1">
            <span className="font-bold">Name:</span> {fileInfo.name}
          </div>
          <div className="mb-1">
            <span className="font-bold">Type:</span> {fileInfo.isDirectory ? 'Directory' : 'File'}
          </div>
          {!fileInfo.isDirectory && (
            <div className="mb-1">
              <span className="font-bold">Size:</span> {fileInfo.size} bytes
            </div>
          )}
          <div className="mb-1">
            <span className="font-bold">Last Modified:</span> {new Date(fileInfo.lastModified).toLocaleString()}
          </div>
          <button
            onClick={() => setIsViewingInfo(false)}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Close
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-4 bg-gray-800 rounded text-center">
          <span>Loading...</span>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded">
          {files.length === 0 ? (
            <p className="text-gray-400">This directory is empty</p>
          ) : (
            <ul>
              {/* Directories first */}
              {sortedDirectories.map((dir, index) => (
                <li 
                  key={`dir-${index}`} 
                  className={`mb-1 flex items-center justify-between hover:bg-gray-700 p-2 rounded ${selectedFile === dir ? 'bg-gray-700' : ''}`}
                >
                  <div 
                    className="flex items-center flex-grow cursor-pointer"
                    onClick={() => handleSelectDirectory(dir)}
                  >
                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {dir.name}
                  </div>

                  {(onDelete || onRename || onGetFileInfo) && (
                    <div className="flex space-x-1">
                      {onGetFileInfo && (
                        <button 
                          onClick={() => handleGetInfo(dir)}
                          className="p-1 text-gray-400 hover:text-white"
                          title="Info"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      {onRename && (
                        <button 
                          onClick={() => {
                            setSelectedFile(dir);
                            setNewFileName(dir.name);
                            setIsRenaming(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                          title="Rename"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => handleDelete(dir)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
              
              {/* Regular files */}
              {sortedFiles.map((file, index) => (
                <li 
                  key={`file-${index}`}
                  className={`mb-1 flex items-center justify-between hover:bg-gray-700 p-2 rounded ${selectedFile === file ? 'bg-gray-700' : ''}`}
                >
                  <div 
                    className="flex items-center flex-grow cursor-pointer"
                    onClick={() => handleSelectFile(file)}
                  >
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span>{file.name}</span>
                    </div>
                  </div>

                  {(onDelete || onRename || onGetFileInfo || onDownloadFile) && (
                    <div className="flex space-x-1">
                      {onDownloadFile && (
                        <button 
                          onClick={() => handleDownload(file)}
                          className="p-1 text-gray-400 hover:text-green-500"
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                      {onGetFileInfo && (
                        <button 
                          onClick={() => handleGetInfo(file)}
                          className="p-1 text-gray-400 hover:text-white"
                          title="Info"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      {onRename && (
                        <button 
                          onClick={() => {
                            setSelectedFile(file);
                            setNewFileName(file.name);
                            setIsRenaming(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                          title="Rename"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => handleDelete(file)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FileBrowser; 