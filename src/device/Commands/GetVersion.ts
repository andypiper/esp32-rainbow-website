import { Command } from '../CommandHandler';
import { CommandIds } from './CommandIds';

class GetVersion extends Command {
  public major: number = 0;
  public minor: number = 0;
  public build: number = 0;

  constructor() {
    super(CommandIds.GetVersion);
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