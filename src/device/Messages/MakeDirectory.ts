import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

class MakeDirectory extends Message {
  public path: string = '';
  public result: string = '';
  public success: boolean = false;
  public error: string | null = null;

  constructor(path: string) {
    super(MessageIds.MakeDirectoryRequest, MessageIds.MakeDirectoryResponse);
    this.path = path;
  }

  public description(): string {
    return `MakeDirectory: ${this.path}`;
  }

  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([...encodedPath, 0x00]);
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
      
      console.log(`MakeDirectory response:`, response);
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      this.result = 'FAIL';
      console.error(this.error);
    }
  }
}

export { MakeDirectory }; 