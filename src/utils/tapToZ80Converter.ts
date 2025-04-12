import { findTapeFile } from './archiveHelpers';

// Declare the type for our WASM module
declare const tap2z80Module: () => Promise<{
  convertTapeToZ80: (filename: string, data: Uint8Array, is128k: boolean) => Uint8Array
}>

const WASM_SCRIPT_ID = 'tap-to-z80-wasm';
const WASM_SCRIPT_URL = '/wasm/tap_to_z80.js';

export interface Z80FileVersion {
  url: string;
  filename: string;
}

export interface Z80ConversionResult {
  spectrum48k: Z80FileVersion | null;
  spectrum128k: Z80FileVersion | null;
  originalFilename: string;
}

export async function loadWasmModule() {
  try {
    await loadWasmScript();
    const module = await tap2z80Module();
    console.log('WASM module initialized');
    return module;
  } catch (err) {
    console.error('WASM init error:', err);
    throw new Error('Failed to initialize converter');
  }
}

function loadWasmScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Check if script is already loaded
    if (document.getElementById(WASM_SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = WASM_SCRIPT_ID;
    script.src = WASM_SCRIPT_URL;
    script.async = true;
    
    script.onload = () => { console.log('WASM script loaded'); resolve(); };
    script.onerror = () => { console.error('Failed to load WASM script'); reject(new Error('Failed to load WASM script')); };
    
    document.body.appendChild(script);
  });
}

export async function convertTapToZ80(
  file: File, 
  wasmModule: { convertTapeToZ80: (filename: string, data: Uint8Array, is128k: boolean) => Uint8Array } | null
): Promise<Z80ConversionResult> {
  if (!wasmModule) {
    throw new Error('Converter not initialized');
  }

  const tapeFile = await findTapeFile(file);
  if (!tapeFile) {
    throw new Error('No valid TAP or TZX file found');
  }

  // Store original filename (without extension)
  const baseFilename = tapeFile.name.replace(/\.[^/.]+$/, '');

  console.log("Converting tape file to both 48K and 128K versions");
  
  // Create 48K version
  const z80Data48k = wasmModule.convertTapeToZ80(tapeFile.name, tapeFile.data, false);
  const z80Filename48k = `${baseFilename}_48k.z80`;
  
  // Create 128K version
  const z80Data128k = wasmModule.convertTapeToZ80(tapeFile.name, tapeFile.data, true);
  const z80Filename128k = `${baseFilename}_128k.z80`;
  
  if (!z80Data48k || !z80Data128k) {
    throw new Error('Conversion failed');
  }

  // Create blobs and URLs for downloads
  const blob48k = new Blob([z80Data48k], { type: 'application/octet-stream' });
  const url48k = URL.createObjectURL(blob48k);
  
  const blob128k = new Blob([z80Data128k], { type: 'application/octet-stream' });
  const url128k = URL.createObjectURL(blob128k);
  
  return {
    spectrum48k: { url: url48k, filename: z80Filename48k },
    spectrum128k: { url: url128k, filename: z80Filename128k },
    originalFilename: baseFilename
  };
}

export function cleanupZ80Resources(z80Files: {
  spectrum48k: Z80FileVersion | null;
  spectrum128k: Z80FileVersion | null;
}) {
  if (z80Files.spectrum48k?.url) {
    URL.revokeObjectURL(z80Files.spectrum48k.url);
  }
  if (z80Files.spectrum128k?.url) {
    URL.revokeObjectURL(z80Files.spectrum128k.url);
  }
} 