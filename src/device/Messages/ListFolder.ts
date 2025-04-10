import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';

class ListFolder extends Message {
  public path: string = '';
  public files: string[] = [];

  constructor(path: string) {
    super(MessageIds.ListFolderRequest, MessageIds.ListFolderResponse);
    this.path = path;
  }

  public description(): string {
    return `ListFolder: ${this.path}`;
  }

  // No data - so default to superclass which is an empty array
  public encode(): Uint8Array {
    const encodedPath = new TextEncoder().encode(this.path);
    return new Uint8Array([...encodedPath, 0x00]);
  }

  public decode(data: Uint8Array) {
    // the data is a list of files seperated by '|'
    const decodedData = new TextDecoder().decode(data);
    this.files = decodedData.split('|');
  }
}

export { ListFolder };