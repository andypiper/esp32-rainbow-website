import { Message } from '../MessageHandler';
import { MessageIds } from './MessageIds';
import { StandardResponse } from './ResponseTypes';

interface VersionInfo {
  major: number;
  minor: number;
  build: number;
}

class GetVersion extends Message {
  public major: number = 0;
  public minor: number = 0;
  public build: number = 0;
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
      
      try {
        const response = JSON.parse(responseText) as StandardResponse<VersionInfo>;
        
        this.success = response.success;
        
        if (response.success && response.result) {
          this.major = response.result.version.major;
          this.minor = response.result.version.minor;
          this.build = response.result.version.build;
        } else {
          this.error = response.errorMessage || 'Unknown error';
        }
        
        console.log(`GetVersion response:`, response);
        return;
      } catch (jsonErr) {
        // Not JSON, try the legacy format
      }
      
      // Legacy format - just 3 bytes for major, minor, build
      if (data.length >= 3) {
        this.major = data[0];
        this.minor = data[1];
        this.build = data[2];
        this.success = true;
        console.log(`GetVersion using legacy format: ${this.major}.${this.minor}.${this.build}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      this.success = false;
      this.error = `Failed to parse version info: ${err}`;
      console.error(this.error);
    }
  }
}

export { GetVersion };