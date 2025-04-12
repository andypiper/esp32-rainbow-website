import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

class RenameFile extends Message {
  public sourcePath: string = '';
  public destinationPath: string = '';
  public result: string = '';
  public success: boolean = false;
  public error: string | null = null;

  constructor(sourcePath: string, destinationPath: string) {
    super(MessageIds.RenameFileRequest, MessageIds.RenameFileResponse);
    this.sourcePath = sourcePath;
    this.destinationPath = destinationPath;
  }

  public description(): string {
    return `RenameFile: ${this.sourcePath} -> ${this.destinationPath}`;
  }

  public encode(): Uint8Array {
    const sourceEncoder = new TextEncoder();
    const destEncoder = new TextEncoder();
    
    const encodedSource = sourceEncoder.encode(this.sourcePath);
    const encodedDest = destEncoder.encode(this.destinationPath);
    
    // Format: [sourcePath]\0[destinationPath]\0
    return new Uint8Array([
      ...encodedSource, 0x00,
      ...encodedDest, 0x00
    ]);
  }

  public decode(data: Uint8Array | null): void {
    if (data === null) {
      this.success = false;
      this.error = 'No response received';
      this.result = 'FAIL';
      return;
    }
    
    const decoder = new TextDecoder();
    const responseText = decoder.decode(data);
    
    try {
      // Parse the JSON response
      const response = JSON.parse(responseText) as StandardResponse<string>;
      
      this.success = response.success;
      
      if (response.success) {
        this.result = response.result || 'OK';
      } else {
        this.error = response.errorMessage || 'Unknown error';
        this.result = 'FAIL';
      }
      
      console.log(`RenameFile response:`, response);
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      this.result = 'FAIL';
      console.error(this.error);
    }
  }
}

export { RenameFile }; 