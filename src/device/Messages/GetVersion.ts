import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class GetVersion extends Message {
  public major: number = 0;
  public minor: number = 0;
  public build: number = 0;

  constructor() {
    super(MessageIds.GetVersionRequest, MessageIds.GetVersionResponse);
  }

  public description(): string {
    return 'GetVersion';
  }

  // No data - so default to superclass which is an empty array
  // public encode(data: string): Uint8Array

  public decode(data: Uint8Array) {
    this.major = data[0];
    this.minor = data[1];
    this.build = data[2];
  }
}

export { GetVersion };