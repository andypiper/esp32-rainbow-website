import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { FileInfo, StandardResponse } from './ResponseTypes';

class GetFileInfo extends Message {
  public path: string = '';
  public isFlash: boolean = false;
  public fileInfo: FileInfo | null = null;
  public error: string | null = null;
  public success: boolean = false;

  constructor(path: string, isFlash: boolean) {
    super(MessageIds.GetFileInfoRequest, MessageIds.GetFileInfoResponse);
    this.path = path;
    this.isFlash = isFlash;
  }

  public description(): string {
    return `GetFileInfo: ${this.path}`;
  }

  public encode(): Uint8Array {
    const message = {
      path: this.path,
      isFlash: this.isFlash,
    }
    return new TextEncoder().encode(JSON.stringify(message)); 
  }

  public decode(data: Uint8Array | null): void {
    if (data === null) {
      this.success = false;
      this.error = 'No response received';
      return;
    }
    
    const decoder = new TextDecoder();
    const responseText = decoder.decode(data);
    
    try {
      // Parse the JSON response
      const response = JSON.parse(responseText) as StandardResponse<FileInfo>;
      
      this.success = response.success;
      
      if (response.success) {
        this.fileInfo = response.result || null;
      } else {
        this.error = response.errorMessage || 'Unknown error';
      }
      
      console.log(`GetFileInfo response:`, response);
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      console.error(this.error);
    }
  }
}

export { GetFileInfo }; 