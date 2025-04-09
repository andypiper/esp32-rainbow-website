import { Command, CommandHandler, Transport } from '../../src/device/CommandHandler';

// Constants defined same as in CommandHandler
const FRAME_BYTE = 0x7E;
const _CRC_SEED = 0x14;
const _ESCAPE_BYTE = 0x7D;
const _ESCAPE_MASK = 0x20;

// Import or redefine the State enum for testing
enum State {
  EXPECTING_FRAME_START_BYTE,
  EXPECTING_FRAME_END_BYTE,
  READING_COMMAND_TYPE,
  READING_COMMAND_LENGTH,
  READING_DATA,
  READING_CRC,
}

// Mock Transport implementation for testing
class MockTransport implements Transport {
  private readQueue: Uint8Array[] = [];
  private writeLog: Uint8Array[] = [];
  
  // Add data to be returned by the next read call
  public queueRead(data: Uint8Array) {
    this.readQueue.push(data);
  }
  
  // Get the log of all data written
  public getWriteLog(): Uint8Array[] {
    return this.writeLog;
  }
  
  // Clear the write log
  public clearWriteLog() {
    this.writeLog = [];
  }
  
  // Implement Transport.read
  public async read(): Promise<Uint8Array> {
    if (this.readQueue.length === 0) {
      // Return empty array if queue is empty
      return new Uint8Array(0);
    }
    
    return this.readQueue.shift() as Uint8Array;
  }
  
  // Implement Transport.write
  public async write(data: Uint8Array): Promise<void> {
    this.writeLog.push(data);
  }
}

// Helper mock command
class MockCommand extends Command {
  public receivedData: Uint8Array | null = null;
  
  constructor(commandType: number) {
    super(commandType);
  }
  
  public override encode(): Uint8Array {
    return new Uint8Array([1, 2, 3, 4]); // Simple test data
  }
  
  public override decode(data: Uint8Array | null): void {
    this.receivedData = data;
  }
}

describe('CommandHandler', () => {
  let transport: MockTransport;
  let commandHandler: CommandHandler;
  
  beforeEach(() => {
    transport = new MockTransport();
    commandHandler = new CommandHandler(transport);
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('sendCommand', () => {
    it('should properly format and send a command packet', async () => {
      const commandType = 0x42;
      const data = new Uint8Array([1, 2, 3, 4]);
      
      await commandHandler.sendCommand(commandType, data);
      
      // Verify something was written
      const writtenData = transport.getWriteLog();
      expect(writtenData.length).toBe(1);
      
      // Verify the packet structure
      const packet = writtenData[0];
      expect(packet[0]).toBe(FRAME_BYTE); // Start with frame byte
      expect(packet[packet.length - 1]).toBe(FRAME_BYTE); // End with frame byte
      
      // Verify the command type is included somewhere in the packet
      let foundCommandType = false;
      for (let i = 0; i < packet.length; i++) {
        if (packet[i] === commandType) {
          foundCommandType = true;
          break;
        }
      }
      expect(foundCommandType).toBeTruthy();
    });
  });
  
  describe('waitForPacket', () => {
    it('should timeout and reject the promise if no response is received', async () => {
      const commandType = 0x42;
      const timeout = 1000;
      
      // Create a promise from waitForPacket with a short timeout
      const packetPromise = commandHandler.waitForPacket(commandType, timeout);
      
      // Advance time past the timeout
      jest.advanceTimersByTime(timeout + 100);
      
      // Verify the promise was rejected with a timeout error
      await expect(packetPromise).rejects.toThrow('Timeout waiting for packet');
    });
    
    it('should reject the previous promise when a new request for the same type is made', async () => {
      const commandType = 0x42;
      
      // Create first promise
      const firstPromise = commandHandler.waitForPacket(commandType);
      
      // Create second promise for the same command type
      const secondPromise = commandHandler.waitForPacket(commandType);
      
      // First promise should be rejected
      await expect(firstPromise).rejects.toThrow('Superseded by newer request for the same command type');
      
      // Second promise should still be pending
      const isPending = await Promise.race([
        secondPromise.then(() => false),
        Promise.resolve(true)
      ]);
      expect(isPending).toBe(true);
    });
  });
  
  describe('basic packet handling', () => {
    it('should handle incomplete data gracefully', async () => {
      // Queue a partial packet
      transport.queueRead(new Uint8Array([FRAME_BYTE])); // Only the start byte
      
      // Process the packet
      await commandHandler.processOnce();
      
      // No errors should be thrown
    });
    
    it('should detect frame byte in unexpected state', async () => {
      // Setup a promise to reject
      const commandType = 0x42;
      const packetPromise = commandHandler.waitForPacket(commandType);
      
      // Manually set the state to simulate being in the middle of a packet
      commandHandler['state'] = State.READING_DATA;
      commandHandler['commandType'] = commandType;
      
      // Process an unexpected frame byte
      transport.queueRead(new Uint8Array([FRAME_BYTE]));
      await commandHandler.processOnce();
      
      // Check that the promise was rejected
      await expect(packetPromise).rejects.toThrow('Unexpected frame byte');
    });
  });
  
  describe('Command class', () => {
    it('should properly encode, send, and decode data', async () => {
      const commandType = 0x42;
      const mockCommand = new MockCommand(commandType);
      
      // Mock the waitForPacket method to return a successful response
      const originalWaitForPacket = commandHandler.waitForPacket;
      commandHandler.waitForPacket = jest.fn().mockImplementation((type) => {
        expect(type).toBe(commandType);
        return Promise.resolve(new Uint8Array([10, 20, 30, 40]));
      });
      
      // Send the command
      const result = await mockCommand.send(commandHandler);
      
      // Verify the result is correct
      expect(result).toEqual(new Uint8Array([10, 20, 30, 40]));
      
      // Verify the data was correctly decoded into the command
      expect(mockCommand.receivedData).toEqual(new Uint8Array([10, 20, 30, 40]));
      
      // Verify the sendCommand was called with the right parameters
      expect(commandHandler.waitForPacket).toHaveBeenCalledWith(commandType);
      
      // Restore original method
      commandHandler.waitForPacket = originalWaitForPacket;
    });
  });
}); 