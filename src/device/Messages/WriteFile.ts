import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class WriteFile extends Message {
  public path: string = '';
  public data: Uint8Array = new Uint8Array();
  public result: string = '';

  constructor(path: string, data: Uint8Array) {
    super(MessageIds.WriteFileRequest, MessageIds.WriteFileResponse);
    this.path = path;
    this.data = data;
  }

  public description(): string {
    return `WriteFile: ${this.path} - ${this.data.length} bytes`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([...encodedPath, 0x00, ...this.data]);
  }

  public decode(data: Uint8Array) {
    // this will be either 'OK' or 'FAIL'
    this.result = new TextDecoder().decode(data);
    console.log(`WriteFile result: ${this.result}`);
  }
}

export { WriteFile };