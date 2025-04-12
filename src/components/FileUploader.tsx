import { useState } from 'react';

interface FileUploaderProps {
  currentPath: string;
  onUpload: (path: string, data: Uint8Array) => Promise<string>;
  isLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ currentPath, onUpload, isLoading = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploader, setShowUploader] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Read the file as an ArrayBuffer
      const buffer = await readFileAsArrayBuffer(file);
      
      // Track progress in a simulated way (actual upload progress tracking not possible with current API)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + (95 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);

      // Convert to Uint8Array
      const data = new Uint8Array(buffer);
      
      // Create the full path including file name
      const fullPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`;
      
      // Upload the file
      await onUpload(fullPath, data);
      
      // Complete the progress and clean up
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setFile(null);
        setShowUploader(false);
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

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="my-3">
      {!showUploader ? (
        <button
          onClick={() => setShowUploader(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          disabled={isLoading}
        >
          Upload File
        </button>
      ) : (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-medium mb-3">Upload File to {currentPath}</h3>
          
          <div className="mb-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm bg-gray-700 text-gray-200 rounded py-2 px-3 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={isUploading}
            />
          </div>
          
          {file && (
            <div className="mb-3 p-2 bg-gray-700 rounded flex items-center justify-between">
              <div>
                <p className="text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white"
                disabled={isUploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {isUploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(uploadProgress)}% Uploaded</p>
            </div>
          )}
          
          {error && (
            <div className="mb-3 p-2 bg-red-900 rounded text-white text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowUploader(false)}
              className="px-3 py-1 text-gray-300 hover:text-white"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              disabled={!file || isUploading}
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