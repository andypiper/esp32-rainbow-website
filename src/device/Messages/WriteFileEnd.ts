import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

class WriteFileEnd extends Message {
  public path: string = '';
  public data: Uint8Array = new Uint8Array();
  public result: string = '';
  public success: boolean = false;
  public error: string | null = null;

  constructor(path: string, data: Uint8Array) {
    super(MessageIds.WriteFileEndRequest, MessageIds.WriteFileEndResponse);
    this.path = path;
    this.data = data;
  }

  public description(): string {
    return `WriteFileEnd: ${this.path} - ${this.data.length} bytes`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([
      ...encodedPath, 0x00,
      this.data.length & 0xff,
      (this.data.length >> 8) & 0xff,
      (this.data.length >> 16) & 0xff,
      (this.data.length >> 24) & 0xff,
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
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      this.result = 'FAIL';
      console.error(this.error);
    }
  }
}

export { WriteFileEnd };