import { useState, useEffect } from 'react';
import useDevice from '../context/useDevice';
import FileBrowser from './FileBrowser';
import FileUploader from './FileUploader';
import { FileInfo } from '../device/Messages/ResponseTypes';
import { STORAGE_TYPE } from '../device/Device';

const ROOT_PATH = '/';

interface StorageFileBrowserProps {
  storageType: STORAGE_TYPE;
  active: boolean;
}

// Tree node structure to represent folder hierarchy
interface TreeNode {
  name: string;
  path: string;
  children: Record<string, TreeNode>;
  expanded: boolean;
}

// Create a new tree node
const createTreeNode = (name: string, path: string): TreeNode => ({
  name,
  path,
  children: {},
  expanded: false
});

export default function StorageFileBrowser({ storageType, active }: StorageFileBrowserProps) {
  const { device, isConnected, versionInfo, getVersion } = useDevice();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [folders, setFolders] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState(ROOT_PATH);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaderFiles, setUploaderFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Tree structure state
  const [folderTree, setFolderTree] = useState<TreeNode>({
    name: 'root',
    path: ROOT_PATH,
    children: {},
    expanded: true
  });
  
  // Fetch files and build folder tree when path changes or when this component becomes active
  useEffect(() => {
    const fetchFiles = async () => {
      if (!isConnected || !versionInfo || !active) return;
      
      // Check if this storage type is available
      const isAvailable = storageType === 'flash' 
        ? versionInfo.flash.available 
        : versionInfo.sd.available;
      
      if (!isAvailable) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const fetchedFiles = await device.listFolder(currentPath, storageType);
        
        // Separate files and folders
        const folderItems = fetchedFiles.filter(file => file.isDirectory);
        const fileItems = fetchedFiles.filter(file => !file.isDirectory);
        
        setFolders(folderItems);
        setFiles(fileItems);
        
        // Update tree with current path's folders
        updateFolderTree(folderItems, currentPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [isConnected, versionInfo, device, currentPath, active, storageType]);
  
  // Helper to update the folder tree with new folders
  const updateFolderTree = (folderItems: FileInfo[], parentPath: string) => {
    setFolderTree(prevTree => {
      // Split path into segments
      const pathParts = parentPath.split('/').filter(part => part !== '');
      
      // Start at the root node
      let currentNode = { ...prevTree };
      let currentPath = '/';
      
      // Navigate to the parent node in the tree
      for (const part of pathParts) {
        currentPath = `${currentPath}${part}/`;
        if (!currentNode.children[part]) {
          currentNode.children[part] = createTreeNode(part, currentPath);
        }
        currentNode.children[part].expanded = true;
        currentNode = currentNode.children[part];
      }
      
      // Add or update child folders
      for (const folder of folderItems) {
        const folderName = folder.name;
        const folderPath = parentPath === '/' 
          ? `/${folderName}/` 
          : `${parentPath}${folderName}/`;
        
        if (!currentNode.children[folderName]) {
          currentNode.children[folderName] = createTreeNode(folderName, folderPath);
        }
      }
      
      return { ...prevTree };
    });
  };

  // File operations
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleDelete = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await device.deleteFile(path, storageType);
      
      // Check if the deleted item is a folder (ends with /)
      if (path.endsWith('/')) {
        // Remove folder from tree
        removeFolderFromTree(path);
        
        // If the current path is the deleted folder or a subfolder, navigate to parent
        if (currentPath === path || currentPath.startsWith(path)) {
          const parentPath = getParentPath(path);
          setCurrentPath(parentPath);
        }
      }
      
      await getVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get parent path
  const getParentPath = (path: string) => {
    // Remove trailing slash if it exists
    const pathWithoutTrailingSlash = path.endsWith('/') && path !== '/' 
      ? path.slice(0, -1) 
      : path;
    
    // Find the last slash in the path
    const lastSlashIndex = pathWithoutTrailingSlash.lastIndexOf('/');
    
    // If there's no slash or it's the root, return root
    if (lastSlashIndex <= 0) {
      return '/';
    } else {
      // Return the parent directory path with trailing slash
      return pathWithoutTrailingSlash.substring(0, lastSlashIndex + 1);
    }
  };
  
  // Helper to remove a folder from the tree
  const removeFolderFromTree = (folderPath: string) => {
    setFolderTree(prevTree => {
      // Clone the tree
      const newTree = { ...prevTree };
      
      // Handle root case separately
      if (folderPath === '/') {
        return {
          name: 'root',
          path: ROOT_PATH,
          children: {},
          expanded: true
        };
      }
      
      // Remove trailing slash for processing
      const normalizedPath = folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath;
      
      // Get the parent path and folder name
      const lastSlashIndex = normalizedPath.lastIndexOf('/');
      const parentPath = normalizedPath.substring(0, lastSlashIndex + 1);
      const folderName = normalizedPath.substring(lastSlashIndex + 1);
      
      // Find the parent node
      let parentNode = newTree;
      const pathParts = parentPath.split('/').filter(part => part !== '');
      
      for (const part of pathParts) {
        if (!parentNode.children[part]) {
          // Parent not found, can't remove
          return prevTree;
        }
        parentNode = parentNode.children[part];
      }
      
      // Delete the folder from parent's children
      if (parentNode.children && folderName in parentNode.children) {
        const newChildren = { ...parentNode.children };
        delete newChildren[folderName];
        parentNode.children = newChildren;
      }
      
      return newTree;
    });
  };

  const handleRename = async (oldPath: string, newPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await device.renameFile(oldPath, newPath, storageType);
      await getVersion();
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
      await device.makeDirectory(path, storageType);
      await getVersion();
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
      return await device.getFileInfo(path, storageType);
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
      return await device.readFile(path, storageType);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return new Uint8Array();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (
    files: { fullPath: string; data: Uint8Array }[],
    onProgress?: (progress: number) => void
  ) => {
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const { fullPath, data } = files[i];
        await device.writeFile(fullPath, data, storageType, (progress) => {
          if (onProgress) {
            const overall = ((i + progress / 100) / files.length) * 100;
            onProgress(overall);
          }
        });
      }
      await getVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setUploaderFiles(droppedFiles);
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

  // Format storage info based on type
  const getStorageInfo = () => {
    if (!versionInfo) return null;
    
    const info = storageType === 'flash' ? versionInfo.flash : versionInfo.sd;
    if (!info.available) return null;
    
    return {
      used: formatBytes(info.used),
      total: formatBytes(info.total)
    };
  };

  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Recursive function to render folder tree
  const renderFolderTree = (node: TreeNode, level = 0) => {
    const isSelected = node.path === currentPath;
    
    return (
      <div key={node.path} style={{ paddingLeft: `${level * 8}px` }}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-indigo-800' : ''}`}
          onClick={() => handleNavigate(node.path)}
        >
          <svg 
            className={`w-5 h-5 mr-2 ${isSelected ? 'text-white' : 'text-yellow-500'}`} 
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
          <span className={`truncate ${isSelected ? 'text-white font-medium' : ''}`}>
            {node.path === ROOT_PATH ? "/" : node.name}
          </span>
        </div>
        {node.expanded && Object.values(node.children).map(childNode => 
          renderFolderTree(childNode, level + 1)
        )}
      </div>
    );
  };

  const storageInfo = getStorageInfo();
  const isAvailable = versionInfo && (
    storageType === 'flash' ? versionInfo.flash.available : versionInfo.sd.available
  );

  if (!active) return null;
  
  return (
    <div>
      {/* Storage usage */}
      {storageInfo && (
        <div className="flex items-center mb-4">
          <div className="flex-grow">
            <span className="text-sm text-gray-300">
              {storageType === 'flash' ? 'Flash' : 'SD'}: {storageInfo.used} used / {storageInfo.total} total.
            </span>
          </div>
        </div>
      )}
      
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
        
        {isAvailable ? (
          <div className="flex">
            {/* Folder Tree */}
            <div className="w-1/4 mr-4 bg-gray-800 rounded p-2 overflow-auto" style={{ maxHeight: '70vh' }}>
              <h3 className="text-lg font-semibold mb-2">Folders</h3>
              {renderFolderTree(folderTree)}
            </div>
            
            {/* File Browser */}
            <div className="w-3/4">
              <FileBrowser
                files={[...folders, ...files]}
                currentPath={currentPath}
                onNavigate={handleNavigate}
                isLoading={isLoading}
                onDelete={handleDelete}
                onRename={handleRename}
                onCreateDirectory={handleCreateDirectory}
                onGetFileInfo={handleGetFileInfo}
                onDownloadFile={handleDownloadFile}
              />
              <FileUploader
                currentPath={currentPath}
                onUpload={handleUpload}
                initialFiles={uploaderFiles}
                onClose={() => { setUploaderFiles([]); }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-700 rounded text-center text-gray-300">
            {storageType === 'flash' 
              ? 'Flash storage is not available on this device.' 
              : 'SD card is not available or not inserted.'}
          </div>
        )}
      </div>
    </div>
  );
} 