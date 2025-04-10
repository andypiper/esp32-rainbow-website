import { useState } from 'react';

type FileBrowserProps = {
  files: string[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoading?: boolean;
}

const FileBrowser = ({ files, currentPath, onNavigate, isLoading = false }: FileBrowserProps) => {
  // Separate directories from files
  const directories = files.filter(file => file.endsWith('/'));
  const regularFiles = files.filter(file => !file.endsWith('/'));

  // Sort alphabetically
  const sortedDirectories = directories.sort((a, b) => a.localeCompare(b));
  const sortedFiles = regularFiles.sort((a, b) => a.localeCompare(b));

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

  return (
    <div className="mt-4">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium mr-2">Files in: </h3>
        <div className="px-3 py-1 bg-gray-800 rounded flex-grow">
          {currentPath}
        </div>
      </div>

      <div className="flex mb-3">
        <button
          onClick={navigateToParent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mr-2"
          disabled={currentPath === '/' || isLoading}
        >
          Parent Directory
        </button>
      </div>

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
                  className="mb-1 flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded"
                  onClick={() => onNavigate(currentPath + dir)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {dir}
                </li>
              ))}
              
              {/* Regular files */}
              {sortedFiles.map((file, index) => (
                <li 
                  key={`file-${index}`}
                  className="mb-1 flex items-center p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {file}
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