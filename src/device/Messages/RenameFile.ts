import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

class RenameFile extends Message {
  public sourcePath: string = '';
  public destinationPath: string = '';
  public isFlash: boolean = false;
  public result: string = '';
  public success: boolean = false;
  public error: string | null = null;

  constructor(sourcePath: string, destinationPath: string, isFlash: boolean) {
    super(MessageIds.RenameFileRequest, MessageIds.RenameFileResponse);
    this.sourcePath = sourcePath;
    this.destinationPath = destinationPath;
    this.isFlash = isFlash;
  }

  public description(): string {
    return `RenameFile: ${this.sourcePath} -> ${this.destinationPath}`;
  }

  public encode(): Uint8Array {
    const message = {
      sourcePath: this.sourcePath,
      destinationPath: this.destinationPath,
      isFlash: this.isFlash,
    }
    return new TextEncoder().encode(JSON.stringify(message)); 
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