import { Command } from '../CommandHandler';
import { CommandIds } from './CommandIds';

class ListFolder extends Command {
  public path: string = '';
  public files: string[] = [];

  constructor(path: string) {
    super(CommandIds.ListFolder);
    this.path = path;
  }

  // No data - so default to superclass which is an empty array
  // public encode(data: string): Uint8Array

  public decode(data: Uint8Array) {
    // the data is a list of files seperated by '|'
    this.files = data.toString().split('|');
  }
}

export { ListFolder };