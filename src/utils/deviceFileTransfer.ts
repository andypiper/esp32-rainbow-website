import { useState } from 'react';
import useDevice from '../context/useDevice';
import { ArchiveFile } from './archiveHelpers';
import { loadWasmModule } from './tapToZ80Converter';

// Cache for the WASM module
let wasmModuleCache: {convertTapeToZ80: (name: string, data: Uint8Array, is128k: boolean) => Uint8Array | null} | null = null;

/**
 * Cleans up a filename to ensure it's compatible with device constraints
 * - Removes all symbols except for the dot separator between name and extension
 * - Limits the filename to 15 characters (including extension)
 * @param filename The original filename
 * @returns The cleaned up filename
 */
function cleanupFilename(filename: string): string {
  // Extract base name and extension
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop() : '';
  const baseName = parts.join('');
  
  // Remove all symbols from base name
  const cleanBaseName = baseName.replace(/[^\w\d]/g, '');
  
  // Calculate available length for base name (15 - extension length - 1 for the dot)
  const maxBaseNameLength = extension ? 15 - extension.length - 1 : 15;
  const truncatedBaseName = cleanBaseName.substring(0, maxBaseNameLength);
  
  // Combine name and extension
  return extension ? `${truncatedBaseName}.${extension}` : truncatedBaseName;
}

/**
 * Downloads and processes a file from a URL
 * @param url The URL to download the file from
 * @param machineType The machine type (48k or 128k)
 * @returns Promise that resolves with the file data
 */
async function downloadAndProcessFile(url: string, machineType?: string): Promise<ArchiveFile | null> {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
        
    // Check if it's a ZIP file
    const isZip = url.toLowerCase().endsWith('.zip');
    
    if (isZip) {
      console.log('Processing ZIP file:', url);
      // For ZIP files, we need to extract the relevant tape file
      const arrayBuffer = await response.arrayBuffer();
      
      // Dynamically import JSZip to handle the ZIP file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const contents = await zip.loadAsync(arrayBuffer);
      
      // Find first .tap or .tzx file in the ZIP
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        const ext = filename.toLowerCase().split('.').pop();
        if ((ext === 'tap' || ext === 'tzx' || ext === 'z80' || ext === 'sna') && !zipEntry.dir) {
          const data = await zipEntry.async('uint8array');
          
          // If it's a tap/tzx file and we have a machine type, convert to Z80
          if ((ext === 'tap' || ext === 'tzx') && machineType) {
            return await convertTapeFileToZ80({
              name: filename,
              data
            }, machineType);
          }
          
          return {
            name: cleanupFilename(filename),
            data
          };
        }
      }
      
      throw new Error('No compatible file found in the ZIP archive');
    } else {
      console.log("Processing direct file:", url);
      // Extract the filename from the URL
      const urlParts = url.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const fileExt = originalFilename.toLowerCase().split('.').pop();
      
      // For direct files, return the data directly
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      
      // If it's a tap/tzx file and we have a machine type, convert to Z80
      if ((fileExt === 'tap' || fileExt === 'tzx') && machineType) {
        return await convertTapeFileToZ80({
          name: originalFilename,
          data: fileData
        }, machineType);
      }
      
      // Clean up the filename
      const cleanedFilename = cleanupFilename(originalFilename);
      
      return {
        name: cleanedFilename,
        data: fileData
      };
    }
  } catch (error) {
    console.error('Error downloading or processing file:', error);
    throw error;
  }
}

/**
 * Converts a TAP/TZX file to Z80 format
 * @param tapeFile The tape file to convert
 * @param machineType The machine type (48k or 128k)
 * @returns Promise that resolves with the converted Z80 file
 */
async function convertTapeFileToZ80(tapeFile: ArchiveFile, machineType: string): Promise<ArchiveFile> {
  try {
    // Load WASM module if not already loaded
    if (!wasmModuleCache) {
      wasmModuleCache = await loadWasmModule();
    }
    
    // Convert file based on machine type
    const is128k = machineType === '128k';
    const baseFilename = tapeFile.name.replace(/\.[^/.]+$/, '');
    const cleanBaseFilename = cleanupFilename(baseFilename);
    
    // Use the WASM module to convert
    const z80Data = wasmModuleCache.convertTapeToZ80(tapeFile.name, tapeFile.data, is128k);
    const z80Filename = `${cleanBaseFilename}.z80`;
    
    if (!z80Data) {
      throw new Error('Conversion failed');
    }
    
    console.log(`Converted ${tapeFile.name} to ${z80Filename} (${machineType})`);
    
    return {
      name: z80Filename,
      data: z80Data
    };
  } catch (error) {
    console.error('Error converting tape to Z80:', error);
    throw new Error(`Failed to convert tape file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * React hook for sending files to the device
 */
export const useSendFileToDevice = () => {
  const { device, isConnected, connect } = useDevice();
  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');
  const [transferProgressPercentage, setTransferProgressPercentage] = useState(0);
  
  const sendFile = async (fileUrl: string, machineType?: string): Promise<string> => {
    // Prevent multiple simultaneous transfers
    if (transferInProgress) {
      throw new Error('A file transfer is already in progress. Please wait for it to complete.');
    }
    
    try {
      setTransferInProgress(true);
      // Download and process the file
      setTransferMessage('Downloading and extracting file...');
      setTransferProgressPercentage(0);
      console.log('Sending file to device:', fileUrl, machineType ? `(${machineType})` : '');
      
      const fileData = await downloadAndProcessFile(fileUrl, machineType);
      if (!fileData) {
        throw new Error('Could not process file');
      }
      
      // Connect to device if not already connected
      if (!isConnected) {
        await connect();
      }

      const version = await device.getVersion();
      console.log('Device version:', version);
      setTransferMessage('Writing file to device...');
      setTransferProgressPercentage(0);
      // Write file to device
      console.log('Writing file to device:', "|" + fileData.name + "|");
      await device.writeFile("/" + fileData.name, fileData.data, true, (progress: number) => {
        setTransferProgressPercentage(progress);
      });
      setTransferMessage('File successfully sent to device');
      setTransferProgressPercentage(100);
      return `File successfully sent to device: ${fileData.name}`;
    } catch (error) {
      console.error('Error sending file to device:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while sending file to device');
      }
    } finally {
      setTransferInProgress(false);
    }
  };
  
  return { 
    sendFile, 
    isTransferInProgress: transferInProgress,
    transferMessage,
    transferProgressPercentage
  };
};
