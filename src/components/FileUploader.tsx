import { useState, useEffect } from 'react';

interface FileToUpload {
  fullPath: string;
  data: Uint8Array;
}

interface FileUploaderProps {
  currentPath: string;
  onUpload: (files: FileToUpload[], onProgress?: (progress: number) => void) => Promise<void>;
  isLoading?: boolean;
  show?: boolean;
  initialFiles?: File[];
  onClose?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ currentPath, onUpload, isLoading = false, show, initialFiles, onClose }) => {
  const [files, setFiles] = useState<File[]>(initialFiles || []);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploader, setShowUploader] = useState(!!show);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Sync show prop with internal state
  useEffect(() => {
    setShowUploader(!!show);
  }, [show]);

  // Sync initialFiles prop with internal state
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  // Handle close
  const handleClose = () => {
    setShowUploader(false);
    setFiles([]);
    setError(null);
    if (onClose) onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    setFiles(droppedFiles);
    setShowUploader(true);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select one or more files to upload');
      return;
    }
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentFileIndex(0);
    try {
      // Prepare files to upload
      const filesToUpload: FileToUpload[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = await readFileAsArrayBuffer(file);
        const data = new Uint8Array(buffer);
        const fullPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`;
        filesToUpload.push({ fullPath, data });
      }
      await onUpload(
        filesToUpload,
        (progress) => {
          // Calculate which file is being uploaded based on progress
          const total = filesToUpload.length;
          const overall = progress * total / 100;
          const idx = Math.min(Math.floor(overall), total - 1);
          setCurrentFileIndex(idx);
          setUploadProgress(progress);
        }
      );
      setUploadProgress(100);
      setCurrentFileIndex(filesToUpload.length - 1);
      setTimeout(() => {
        setUploadProgress(0);
        setFiles([]);
        setShowUploader(false);
        setCurrentFileIndex(0);
      }, 1000);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to read a file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="my-3"
      style={{ minHeight: 40 }}
    >
      {files.length > 0 && (
      <div className="p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-medium mb-3">Upload File(s) to {currentPath}</h3>
          <div className="mb-3">
            {files.map((file, idx) => (
              <div key={idx} className="mb-1 p-2 bg-gray-700 rounded flex items-center justify-between">
                <div>
                  <p className="text-sm">{file.name}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="text-gray-400 hover:text-white"
                  disabled={isUploading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        {isUploading && files.length > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Uploading {files[currentFileIndex]?.name} ({currentFileIndex + 1} of {files.length}): {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
        {error && (
          <div className="mb-3 p-2 bg-red-900 rounded text-white text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-3 py-1 text-gray-300 hover:text-white"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            disabled={files.length === 0 || isUploading}
          >
            Upload
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default FileUploader; 