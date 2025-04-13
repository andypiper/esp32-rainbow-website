import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

class WriteFileData extends Message {
  public path: string = '';
  public data: Uint8Array = new Uint8Array();
  public result: string = '';
  public success: boolean = false;
  public error: string | null = null;

  constructor(path: string, data: Uint8Array) {
    super(MessageIds.WriteFileDataRequest, MessageIds.WriteFileDataResponse);
    this.path = path;
    this.data = data;
  }

  public description(): string {
    return `WriteFileData: ${this.path} - ${this.data.length} bytes`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([
      ...encodedPath, 0x00,
      ...this.data,
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
      
      console.log(`WriteFileData response:`, response);
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse response: ${err}`;
      this.result = 'FAIL';
      console.error(this.error);
    }
  }
}

export { WriteFileData };