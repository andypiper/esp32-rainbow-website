import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class ReadFile extends Message {
  public path: string = '';
  public isFlash: boolean = false;
  public result: Uint8Array = new Uint8Array();
  public success: boolean = false;
  public error: string | null = null;

  constructor(path: string, isFlash: boolean) {
    super(MessageIds.ReadFileRequest, MessageIds.ReadFileResponse);
    this.path = path;
    this.isFlash = isFlash;
  }

  public description(): string {
    return `ReadFile: ${this.path}`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const message = {
      path: this.path,
      isFlash: this.isFlash,
    }
    return new TextEncoder().encode(JSON.stringify(message)); 
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