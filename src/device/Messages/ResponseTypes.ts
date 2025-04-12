/**
 * Standard response format for all device operations
 */
export interface StandardResponse<T> {
  success: boolean;
  errorMessage?: string;
  result?: T;
}

/**
 * File info response type
 */
export interface FileInfo {
  size: number;
  isDirectory: boolean;
  lastModified: number; // Unix timestamp
  name: string;
}

/**
 * File entry for directory listings
 */
export interface FileEntry {
  name: string;
  isDirectory: boolean;
} 