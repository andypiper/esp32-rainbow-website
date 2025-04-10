import { GetVersion } from "./Messages/GetVersion";
import { Transport, MessageHandler} from "./MessageHandler";
import { ListFolder } from "./Messages/ListFolder";
import { WriteFile } from "./Messages/WriteFile";
import { ReadFile } from "./Messages/ReadFile";

class SerialTransport implements Transport {
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private writer: WritableStreamDefaultWriter<Uint8Array>;

    constructor(private port: SerialPort) {
        if (!this.port.readable || !this.port.writable) {
            throw new Error('Port is not readable or writable');
        }
        this.reader = this.port.readable.getReader();
        this.writer = this.port.writable.getWriter();
    }

    public async read(): Promise<Uint8Array> {
        // read a new chunk of data
        const result = await this.reader.read();
        if (result.done) {
            throw new Error('Port is closed');
        }
        console.log(`Reading ${result.value.length} bytes`);
        // dump out the data as hex
        console.log(Array.from(result.value).map(b => b.toString(16).padStart(2, '0')).join(' '));
        // dump out the data as ascii - replace non-printable characters with '.'
        console.log(Array.from(result.value).map(b => b < 0xa || b > 126 ? '.' : String.fromCharCode(b)).join(''));
        return result.value;
    }

    public async write(data: Uint8Array): Promise<void> {
        // console.log(`Writing ${data.length} bytes`);
        // // dump out the data as hex
        // console.log(Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
        // // dump out the data as ascii - replace non-printable characters with '.'
        // console.log(Array.from(data).map(b => b < 0xa || b > 126 ? '.' : String.fromCharCode(b)).join(''));
        await this.writer.ready
        await this.writer.write(data);
    }

    public async close(): Promise<void> {
        await this.reader.cancel();
        await this.writer.close();
    }
}

class Device {
    private messageHandler: MessageHandler | null = null;
    private transport: SerialTransport | null = null;
    private port: SerialPort | null = null;
    private processingInterval: number | null = null;
    private readonly PROCESSING_INTERVAL_MS = 1; // 5ms interval for processing
    private lastBaudRate: number = 460800; // Store the last baud rate used

    constructor(options: { baudRate?: number } = {}) {
        this.lastBaudRate = options.baudRate || 460800;
    }

    public async connect(options?: { baudRate?: number }): Promise<void> {
        // Update baudRate from options if provided
        if (options?.baudRate) {
            this.lastBaudRate = options.baudRate;
        }

        try {
            const port = await navigator.serial.requestPort();
            // need to open the port with these optiosn - 460800 8-N-1
            await port.open({ baudRate: this.lastBaudRate, dataBits: 8, stopBits: 1, parity: 'none' });
            this.port = port;
            this.transport = new SerialTransport(port);
            this.messageHandler = new MessageHandler(this.transport);
            
            // Start processing data
            this.startProcessing();
        } catch (error) {
            console.error("Failed to connect:", error);
            await this.disconnect();
            throw error;
        }
    }

    public async reconnect(): Promise<void> {
        // Disconnect first if already connected
        if (this.isConnected()) {
            await this.disconnect();
        }
        
        // Try to reconnect using the last port if available
        try {
            // If we have a portInfo saved, we can try to reconnect to the same port
            if (this.port) {
                await this.port.open({ baudRate: this.lastBaudRate });
                this.transport = new SerialTransport(this.port);
                this.messageHandler = new MessageHandler(this.transport);
                this.startProcessing();
                return;
            }
        } catch (error) {
            console.error("Failed to reconnect to the same port:", error);
        }
        
        // If we couldn't reconnect to the same port, try a new connection
        await this.connect({ baudRate: this.lastBaudRate });
    }

    public async disconnect(): Promise<void> {
        this.stopProcessing();
        
        if (this.transport) {
            try {
                await this.transport.close();
            } catch (error) {
                console.error("Error closing transport:", error);
            }
            this.transport = null;
        }
        
        if (this.port && this.port.readable) {
            try {
                await this.port.close();
            } catch (error) {
                console.error("Error closing port:", error);
            }
            this.port = null;
        }
        
        this.messageHandler = null;
    }

    private startProcessing(): void {
        if (this.processingInterval !== null) {
            return;
        }

        this.processingInterval = window.setTimeout(async () => {
            if (this.messageHandler) {
                try {
                    console.log("Process once start");
                    await this.messageHandler.processOnce();
                    console.log("Process once done");
                    // schedule the next processing interval
                    this.processingInterval = null;
                    this.startProcessing();
                } catch (error: unknown) {
                    console.error("Error in processing interval:", error);
                    // If we encounter a fatal error, disconnect
                    if (error instanceof Error && error.message === 'Port is closed') {
                        this.disconnect();
                    }
                    this.processingInterval = null;
                }
            }
        }, this.PROCESSING_INTERVAL_MS);
    }

    private stopProcessing(): void {
        if (this.processingInterval !== null) {
            window.clearTimeout(this.processingInterval);
            this.processingInterval = null;
        }
    }

    public async getVersion(): Promise<string> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new GetVersion();
        await message.send(this.messageHandler);
        return `${message.major}.${message.minor}.${message.build}`;
    }

    public async listFolder(path: string): Promise<string[]> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new ListFolder(path);
        await message.send(this.messageHandler);
        return message.files;
    }

    public async writeFile(path: string, data: Uint8Array): Promise<string> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Writing file', path, data.length, 'bytes');
        const message = new WriteFile(path, data);
        await message.send(this.messageHandler);
        return message.result;
    }

    public async readFile(path: string): Promise<Uint8Array> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new ReadFile(path);
        await message.send(this.messageHandler);
        return message.result;
    }
    
    public isConnected(): boolean {
        return this.messageHandler !== null && this.port !== null;
    }
}

export default Device;