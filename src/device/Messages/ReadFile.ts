import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class ReadFile extends Message {
  public path: string = '';
  public result: Uint8Array = new Uint8Array();
  public success: boolean = false;
  public error: string | null = null;

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

  public decode(data: Uint8Array | null): void {
    if (data === null || data.length === 0) {
      this.success = false;
      this.error = 'No response received';
      this.result = new Uint8Array();
      return;
    }
    // success - we got data back
    this.success = true;
    this.result = data;
  }
}

export { ReadFile };