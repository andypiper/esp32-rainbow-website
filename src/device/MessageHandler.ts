import { MessageIds } from "./Messages/MessageIds";

const FRAME_BYTE = 0x7e;
const ESCAPE_BYTE = 0x7d;
const ESCAPE_MASK = 0x20;

// Basic interface for a transport layer
interface Transport {
  read(): Promise<Uint8Array>;
  write(data: Uint8Array): Promise<void>;
}

enum State {
  EXPECTING_FRAME_START_BYTE,
  EXPECTING_FRAME_END_BYTE,
  READING_COMMAND_TYPE,
  READING_COMMAND_LENGTH,
  READING_DATA,
  READING_CRC,
}

class Deferred<T> {
  public promise: Promise<T>;
  public resolve: (value: T) => void = () => {};
  public reject: (reason?: Error) => void = () => {};
  public timeout: NodeJS.Timeout | null = null;

  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

class MessageHandler {
  private state: State = State.EXPECTING_FRAME_START_BYTE;

  private commandType: number = 0;
  private commandLength: number = 0;
  private lengthByteCount: number = 0;
  private receivedCrc: number = 0;
  private receivedCrcLength: number = 0;
  private calculatedCrc: number = 0;
  private dataBuffer: Uint8Array = new Uint8Array();
  private bufferPosition: number = 0;
  private totalRead: number = 0;
  private escapeNextByte: boolean = false;
  // Map of command types to promises of a result
  private resultPromise: { [key: number]: Deferred<Uint8Array | null> } = {};

  private crc32Table: Uint32Array = new Uint32Array(256);

  constructor(private transport: Transport) {
    this.generateCRCTable();
  }

  private processWaitingForStartByte(data: number): State {
    return data === FRAME_BYTE ? State.READING_COMMAND_TYPE : State.EXPECTING_FRAME_START_BYTE;
  }

  private processExpectingFrameByte(data: number): State {
    this.receivedCrc = this.finalizeCRC32(this.receivedCrc);
    const isValid = this.receivedCrcLength === 4 && this.calculatedCrc === this.receivedCrc && data === FRAME_BYTE;
    
    // Process the promise for this command type if it exists
    const promise = this.resultPromise[this.commandType];
    if (promise) {
      if (promise.timeout) {
        clearTimeout(promise.timeout);
      }
      
      if (isValid) {
        promise.resolve(this.dataBuffer);
      } else {
        promise.reject(new Error('Invalid packet: CRC check failed or invalid frame structure'));
      }
      
      // Remove the promise
      delete this.resultPromise[this.commandType];
    }
    
    // Reset packet processing state variables for the next packet
    this.commandType = 0;
    this.commandLength = 0;
    this.lengthByteCount = 0;
    this.receivedCrc = 0;
    this.receivedCrcLength = 0;
    this.calculatedCrc = 0;
    this.dataBuffer = new Uint8Array();
    this.bufferPosition = 0;
    this.totalRead = 0;
    
    return State.EXPECTING_FRAME_START_BYTE;
  }

  private processReadingCommandType(data: number): State {
    this.commandType = data;
    this.lengthByteCount = 0;
    this.commandLength = 0;
    this.receivedCrc = 0;
    this.receivedCrcLength = 0;
    this.totalRead = 0;
    this.calculatedCrc = 0xffffffff;
    this.calculatedCrc = this.updateCRC32(this.calculatedCrc, data);
    return State.READING_COMMAND_LENGTH;
  }

  private processReadingCommandLength(data: number): State {
    this.calculatedCrc = this.updateCRC32(this.calculatedCrc, data);
    this.commandLength |= data << (this.lengthByteCount * 8);
    this.lengthByteCount++;

    if (this.lengthByteCount < 4) return State.READING_COMMAND_LENGTH;

    this.totalRead = 0;
    this.bufferPosition = 0;
    this.dataBuffer = new Uint8Array(this.commandLength);
    return this.commandLength > 0 ? State.READING_DATA : State.READING_CRC;
  }

  private processReadingData(data: number): State {
    if (this.totalRead < this.commandLength) {
      this.calculatedCrc = this.updateCRC32(this.calculatedCrc, data);
      this.dataBuffer[this.bufferPosition++] = data;
      this.totalRead++;

      if (this.totalRead === this.commandLength) {
        this.bufferPosition = 0;
      }
    }
    return this.totalRead < this.commandLength ? State.READING_DATA : State.READING_CRC;
  }

  private processReadingCRC(data: number): State {
    this.receivedCrc |= data << (this.receivedCrcLength * 8);
    this.receivedCrcLength++;
    return this.receivedCrcLength < 4 ? State.READING_CRC : State.EXPECTING_FRAME_END_BYTE;
  }

  private generateCRCTable() {
    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc >>>= 1;
        }
      }
      this.crc32Table[i] = crc >>> 0;
    }
  }

  private updateCRC32(crc: number, byte: number): number {
    const lookupIndex = (crc ^ byte) & 0xff;
    return (crc >>> 8) ^ this.crc32Table[lookupIndex];
  }

  private finalizeCRC32(crc: number): number {
    return crc ^ 0xffffffff;
  }

  private writeEscaped(byte: number, frame: number[], crc: number = 0xffffffff,): number {
    if (byte === FRAME_BYTE || byte === ESCAPE_BYTE) {
      frame.push(ESCAPE_BYTE);
      frame.push(byte ^ ESCAPE_MASK);
    } else {
      frame.push(byte);
    }
    return this.updateCRC32(crc, byte);
  }

  private rejectInFlightPromise(error: Error) {
    if (this.commandType !== 0) {
      const promise = this.resultPromise[this.commandType];
      if (promise) {
        promise.reject(error);
        delete this.resultPromise[this.commandType];
      }
    }        
  }

  private resetState() {
    // Reset state variables
    this.commandType = 0;
    this.commandLength = 0;
    this.lengthByteCount = 0;
    this.receivedCrc = 0;
    this.receivedCrcLength = 0;
    this.calculatedCrc = 0;
    this.dataBuffer = new Uint8Array();
    this.bufferPosition = 0;
    this.totalRead = 0;     
    this.escapeNextByte = false;
    // Reset to initial state
    this.state = State.EXPECTING_FRAME_START_BYTE;
  }

  // Send a packet to the device
  async sendCommand(type: number, data: Uint8Array) {
    const frame: number[] = [];
    frame.push(FRAME_BYTE);
    let crc = this.writeEscaped(type, frame);
    crc = this.writeEscaped(data.length & 0xff, frame, crc);
    crc = this.writeEscaped((data.length >> 8) & 0xff, frame, crc);
    crc = this.writeEscaped((data.length >> 16) & 0xff, frame, crc);
    crc = this.writeEscaped((data.length >> 24) & 0xff, frame, crc);
    for (const byte of data) {
      crc = this.writeEscaped(byte, frame, crc);
    }
    crc = this.finalizeCRC32(crc);
    for (let i = 0; i < 4; i++) {
      this.writeEscaped((crc >> (i * 8)) & 0xff, frame, crc);
    }
    frame.push(FRAME_BYTE);
    await this.transport.write(new Uint8Array(frame));
  }

  // Wait for a packet to be received from the device
  async waitForPacket(type: number, timeout: number = 30000) {
    const resultPromise = new Deferred<Uint8Array | null>();
    
    // If there's already a pending promise for this command type, reject it
    if (this.resultPromise[type]) {
      const oldPromise = this.resultPromise[type];
      if (oldPromise.timeout) {
        clearTimeout(oldPromise.timeout);
      }
      oldPromise.reject(new Error('Superseded by newer request for the same command type'));
    }
    
    // Store our new promise
    this.resultPromise[type] = resultPromise;
    
    // Setup a timeout to remove the promise and reject it
    resultPromise.timeout = setTimeout(() => {
      if (this.resultPromise[type] === resultPromise) {
        delete this.resultPromise[type];
      }
      resultPromise.reject(new Error('Timeout waiting for packet'));
    }, timeout);
    
    // Return the promise
    return resultPromise.promise;
  }

  // Process a single chunk of data from the transport
  async processOnce(): Promise<void> {
    const bytes = await this.transport.read();
    for (const byte of bytes) {
      try {
          // Check for a frame delimiter in the wrong state
        if (byte === FRAME_BYTE && 
            this.state !== State.EXPECTING_FRAME_START_BYTE && 
            this.state !== State.EXPECTING_FRAME_END_BYTE) {
          // Frame byte in unexpected state - reset and notify
          this.rejectInFlightPromise(new Error('Unexpected frame byte: Packet framing error'));
          this.resetState();
          continue;
        }

        // unescape the data if we received an escape byte
        if (byte === ESCAPE_BYTE) {
          this.escapeNextByte = true;
          continue;
        }

        let unescapedByte = byte;
        if (this.escapeNextByte) {
          unescapedByte = byte ^ ESCAPE_MASK;
          this.escapeNextByte = false;
        }

        // process the data
        switch (this.state) {
          case State.EXPECTING_FRAME_START_BYTE:
            this.state = this.processWaitingForStartByte(unescapedByte);
            break;
          case State.EXPECTING_FRAME_END_BYTE:
            this.state = this.processExpectingFrameByte(unescapedByte);
            break;
          case State.READING_COMMAND_TYPE:
            this.state = this.processReadingCommandType(unescapedByte);
            break;
          case State.READING_COMMAND_LENGTH:
            this.state = this.processReadingCommandLength(unescapedByte);
            break;
          case State.READING_DATA:
            this.state = this.processReadingData(unescapedByte);
            break;
          case State.READING_CRC:
            this.state = this.processReadingCRC(unescapedByte);
            break;
          default:
            this.state = State.EXPECTING_FRAME_START_BYTE;
        }
      } catch (error) {
        console.error("Error processing data:", error);
        this.rejectInFlightPromise(new Error(`Error processing data: ${error}`));
        this.resetState();
      }
    }
  }
}

class Message {
  public messageRequestType: number;
  public messageResponseType: number;

  public encode(): Uint8Array {
    // default to no data - empty array
    return new Uint8Array();
  }

  public decode(_: Uint8Array | null) {
    // Default implementation does nothing
    // Child classes should override this method
  }

  public description(): string {
    return `Message ${this.messageRequestType}`;
  }

  public async send(messageHandler: MessageHandler) {
    try {
      console.log(`Sending message: ${this.description()}`);
      await messageHandler.sendCommand(this.messageRequestType, this.encode());
      if (this.messageResponseType !== MessageIds.NullResponse) {
        const result = await messageHandler.waitForPacket(this.messageResponseType); 
        // Only call decode if we have valid data
        if (result) {
          this.decode(result);
        }
      }
    } catch (error) {
      console.error(`Error executing message ${this.messageRequestType}:`, error);
      throw error;
    }
  }

  constructor(messageRequestType: number, messageResponseType: number) {
    this.messageRequestType = messageRequestType;
    this.messageResponseType = messageResponseType;
  }
}

export type { Transport };
export { MessageHandler, Message };