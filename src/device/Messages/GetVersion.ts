import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

export interface VersionInfo {
  firmwareVersion: string;
  hardwareVersion: string;
  flash: {
    available: boolean,
    total: number,
    used: number
  },
  sd: {
    available: boolean,
    total: number,
    used: number
  }
}

class GetVersion extends Message {
  public versionInfo: VersionInfo | null = null;
  public success: boolean = false;
  public error: string | null = null;

  constructor() {
    super(MessageIds.GetVersionRequest, MessageIds.GetVersionResponse);
  }

  public description(): string {
    return 'GetVersion';
  }

  // No data needed for GetVersion request
  // public encode(): Uint8Array

  public decode(data: Uint8Array | null): void {
    if (data === null) {
      this.success = false;
      this.error = 'No response received';
      return;
    }
    
    try {
      // First try to parse as a JSON response
      const decoder = new TextDecoder();
      const responseText = decoder.decode(data);
      
      const response = JSON.parse(responseText) as StandardResponse<VersionInfo>;
      
      this.success = response.success;
      
      if (response.success && response.result) {
        this.versionInfo = response.result;
      } else {
        this.error = response.errorMessage || 'Unknown error';
      }
      
      console.log(`GetVersion response:`, response);
      return;
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse version info: ${err}`;
      console.error(this.error);
    }
  }
}

export { GetVersion };