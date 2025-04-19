import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { FileInfo, StandardResponse } from './ResponseTypes';

class ListFolder extends Message {
  public path: string = '';
  public isFlash: boolean = false;
  public files: FileInfo[] = [];
  public success: boolean = false;
  public error: string | null = null;

  constructor(path: string, isFlash: boolean) {
    super(MessageIds.ListFolderRequest, MessageIds.ListFolderResponse);
    this.path = path;
    this.isFlash = isFlash;
  }

  public description(): string {
    return `ListFolder: ${this.path}`;
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
      this.files = [];
      return;
    }
    
    const decoder = new TextDecoder();
    const responseText = decoder.decode(data);
    
    try {
      // Parse the JSON response
      const response = JSON.parse(responseText) as StandardResponse<{files: FileInfo[]}>;
      
      this.success = response.success;
      
      if (response.success) {
        this.files = response.result?.files || [];
      } else {
        this.error = response.errorMessage || 'Unknown error';
        this.files = [];
      }
      
      console.log(`ListFolder response:`, response);
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      this.files = [];
      console.error(this.error);
    }
  }
}

export { ListFolder };