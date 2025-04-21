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
  // Sort files alphabetically
  const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

  // Sort files alphabetically
  const sortedDirectories = sortedFiles.filter(file => file.isDirectory).sort((a, b) => a.name.localeCompare(b.name));
  const sortedRegularFiles = sortedFiles.filter(file => !file.isDirectory).sort((a, b) => a.name.localeCompare(b.name));

  // Combined list with directories first
  const sortedItems = [...sortedDirectories, ...sortedRegularFiles];

  // State for UI operations
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (file.isDirectory) {
      // Navigate to the directory
      onNavigate(currentPath + file.name + '/');
    } else {
      // Select the file
      setSelectedFile(file);
      setNewFileName(file.name);
      
      if (onSelectFile) {
        onSelectFile(currentPath + file.name);
      }
    }
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

  // Handle deleting a file
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

  // Handle renaming a file
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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mt-4">
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

      {isRenaming && selectedFile && (
        <div className="p-4 bg-gray-700 rounded mb-3">
          <h4 className="text-lg mb-2">Rename {selectedFile.isDirectory ? 'Directory' : 'File'}</h4>
          <div className="flex mb-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="px-3 py-2 text-black rounded-l flex-grow"
              placeholder="New name"
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

      {isLoading ? (
        <div className="p-4 bg-gray-700 rounded text-center">
          Loading...
        </div>
      ) : (
        <div className="bg-gray-900 rounded overflow-hidden">
          {/* File list */}
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-center text-gray-400">
                    No files in this directory
                  </td>
                </tr>
              )}
              
              {sortedItems.map((file) => (
                <tr 
                  key={file.name} 
                  className={`hover:bg-gray-800 ${selectedFile?.name === file.name ? 'bg-gray-700' : ''}`}
                >
                  <td 
                    className={`px-4 py-2 cursor-pointer ${file.isDirectory ? 'text-indigo-300 font-medium' : ''}`}
                    onClick={() => handleSelectFile(file)}
                  >
                    {file.isDirectory ? (
                      <svg 
                        className="w-5 h-5 inline-block mr-2 text-yellow-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        className="w-5 h-5 inline-block mr-2 text-blue-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                    )}
                    {file.name}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-3">
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
                      {!file.isDirectory && onDownloadFile && (
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex mt-3 flex-wrap">
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
    </div>
  );
};

export default FileBrowser; 