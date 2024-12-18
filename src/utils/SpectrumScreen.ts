// ZX Spectrum color palette
const SPECTRUM_COLORS = [
  [0x00, 0x00, 0x00], // Black
  [0x00, 0x00, 0xD7], // Blue
  [0xD7, 0x00, 0x00], // Red
  [0xD7, 0x00, 0xD7], // Magenta
  [0x00, 0xD7, 0x00], // Green
  [0x00, 0xD7, 0xD7], // Cyan
  [0xD7, 0xD7, 0x00], // Yellow
  [0xD7, 0xD7, 0xD7], // White
  [0x00, 0x00, 0x00], // Bright Black
  [0x00, 0x00, 0xFF], // Bright Blue
  [0xFF, 0x00, 0x00], // Bright Red
  [0xFF, 0x00, 0xFF], // Bright Magenta
  [0x00, 0xFF, 0x00], // Bright Green
  [0x00, 0xFF, 0xFF], // Bright Cyan
  [0xFF, 0xFF, 0x00], // Bright Yellow
  [0xFF, 0xFF, 0xFF], // Bright White
];

// Cache settings
const CACHE_NAME = 'spectrum-scr-cache';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Development settings
const isDevelopment = import.meta.env.DEV;
const DEV_PROXY_URL = 'http://localhost:8787/proxy';

export class SpectrumScreen {
  private width: number = 256;
  private height: number = 192;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private flashTimer: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    
    this.imageData = this.ctx.createImageData(this.width, this.height);
  }

  private async fetchWithCache(url: string): Promise<ArrayBuffer> {
    // Try to get from Cache API first
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        const cachedData = await cachedResponse.arrayBuffer();
        // Check if the cached data is valid SCR data
        if (cachedData.byteLength === 6912) {
          return cachedData;
        }
      }
    } catch (error) {
      console.warn('Cache API access failed:', error);
    }

    // If not in cache, fetch it through our proxy
    const proxyBaseUrl = isDevelopment ? DEV_PROXY_URL : '/proxy';
    const proxyUrl = `${proxyBaseUrl}?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // Store in Cache API for future use
    try {
      const cache = await caches.open(CACHE_NAME);
      const headers = new Headers({
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
        'Last-Modified': new Date().toUTCString()
      });
      const response = new Response(buffer, { headers });
      await cache.put(url, response);
    } catch (error) {
      console.warn('Failed to cache SCR file:', error);
    }

    return buffer;
  }

  private getDecodedImageKey(url: string): string {
    return `spectrum-decoded-${url}`;
  }

  private async getDecodedFromCache(url: string): Promise<string | null> {
    try {
      const key = this.getDecodedImageKey(url);
      const cached = localStorage.getItem(key);
      
      if (cached) {
        const { timestamp, dataUrl } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return dataUrl;
        }
        // Remove expired cache entry
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    return null;
  }

  private async saveDecodedToCache(url: string, dataUrl: string): Promise<void> {
    try {
      const key = this.getDecodedImageKey(url);
      const cacheEntry = {
        timestamp: Date.now(),
        dataUrl
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  private setPixel(x: number, y: number, color: number[]) {
    const index = (y * this.width + x) * 4;
    this.imageData.data[index] = color[0];     // R
    this.imageData.data[index + 1] = color[1]; // G
    this.imageData.data[index + 2] = color[2]; // B
    this.imageData.data[index + 3] = 255;      // A
  }

  private getPixelByteAddress(screenY: number, col: number): number {
    // Convert to Spectrum's weird memory layout:
    // Pixel address = (y7,y6) * 2048 + (y2,y1,y0) * 256 + (y5,y4,y3) * 32 + x4,x3,x2,x1,x0
    const y76 = screenY & 0b11000000;
    const y210 = (screenY & 0b00000111) << 3;
    const y543 = (screenY & 0b00111000) >> 3;
    return (y76 + y210 + y543) * 32 + col;
  }

  public async loadFromBuffer(buffer: ArrayBuffer): Promise<HTMLCanvasElement> {
    const data = new Uint8Array(buffer);
    
    // Check if the file size is correct (6912 bytes for SCR format)
    if (data.length !== 6912) {
      throw new Error('Invalid SCR file size');
    }

    const attrBase = 0x1800;  // 6144 - start of attribute memory
    const pixelBase = 0;      // start of pixel memory

    // Process screen by attribute blocks (8x8 pixels)
    for (let attrY = 0; attrY < this.height / 8; attrY++) {
      for (let attrX = 0; attrX < this.width / 8; attrX++) {
        // Get the attribute byte for this 8x8 block
        const attr = data[attrBase + 32 * attrY + attrX];
        
        // Extract colors
        let inkColor = attr & 0b00000111;
        let paperColor = (attr & 0b00111000) >> 3;
        const bright = (attr & 0b01000000) !== 0;
        const flash = (attr & 0b10000000) !== 0;

        // Handle flash attribute (swap colors if flashing)
        if (flash && this.flashTimer < 16) {
          [inkColor, paperColor] = [paperColor, inkColor];
        }

        // Apply brightness
        if (bright) {
          inkColor += 8;
          paperColor += 8;
        }

        // Get the final colors from our palette
        const inkRGB = SPECTRUM_COLORS[inkColor];
        const paperRGB = SPECTRUM_COLORS[paperColor];

        // Process each row in the 8x8 block
        for (let y = 0; y < 8; y++) {
          const screenY = attrY * 8 + y;
          const col = (attrX * 8) >> 3;
          
          // Get the pixel byte using the Spectrum's memory layout
          const pixelOffset = this.getPixelByteAddress(screenY, col);
          let pixelByte = data[pixelBase + pixelOffset];

          // Process each bit in the byte (8 pixels)
          for (let x = 0; x < 8; x++) {
            const screenX = attrX * 8 + x;
            const isInk = (pixelByte & 0b10000000) !== 0;
            this.setPixel(screenX, screenY, isInk ? inkRGB : paperRGB);
            pixelByte <<= 1;
          }
        }
      }
    }

    // Update canvas with the processed image data
    this.ctx.putImageData(this.imageData, 0, 0);
    return this.canvas;
  }

  public async loadFromFile(file: File): Promise<HTMLCanvasElement> {
    const buffer = await file.arrayBuffer();
    return this.loadFromBuffer(buffer);
  }

  public async loadFromUrl(url: string): Promise<HTMLCanvasElement> {
    try {
      // Try to get decoded image from cache first
      const cachedDecoded = await this.getDecodedFromCache(url);
      if (cachedDecoded) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.drawImage(img, 0, 0);
            resolve(this.canvas);
          };
          img.src = cachedDecoded;
        });
      }

      // If not in cache, load and decode the SCR file
      const buffer = await this.fetchWithCache(url);
      await this.loadFromBuffer(buffer);
      
      // Cache the decoded image
      const dataUrl = this.toDataURL();
      await this.saveDecodedToCache(url, dataUrl);
      
      return this.canvas;
    } catch (error) {
      throw new Error(`Failed to load SCR file from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public toDataURL(): string {
    return this.canvas.toDataURL('image/png');
  }
} 