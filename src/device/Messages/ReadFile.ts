import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class ReadFile extends Message {
  public path: string = '';
  public result: Uint8Array = new Uint8Array();

  constructor(path: string) {
    super(MessageIds.ReadFileRequest, MessageIds.ReadFileResponse);
    this.path = path;
  }

  public description(): string {
    return `ReadFile: ${this.path}`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([...encodedPath, 0x00]);
  }

  public decode(data: Uint8Array) {
    // this will be either 'OK' or 'FAIL'
    this.result = data;
    console.log(`ReadFile result: ${this.result}`);
  }
}

export { ReadFile };