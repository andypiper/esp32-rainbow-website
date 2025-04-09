import { GetVersion } from "./Commands/GetVersion";
import { Transport, CommandHandler} from "./CommandHandler";
import { ListFolder } from "./Commands/ListFolder";

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
        return result.value;
    }

    public async write(data: Uint8Array): Promise<void> {
        await this.writer.write(data);
    }

    public async close(): Promise<void> {
        await this.reader.cancel();
        await this.writer.close();
    }
}

class Device {
    private commandHandler: CommandHandler | null = null;
    private transport: SerialTransport | null = null;
    private port: SerialPort | null = null;
    private processingInterval: number | null = null;
    private readonly PROCESSING_INTERVAL_MS = 5; // 5ms interval for processing
    private lastBaudRate: number = 115200; // Store the last baud rate used

    constructor(options: { baudRate?: number } = {}) {
        this.lastBaudRate = options.baudRate || 115200;
    }

    public async connect(options?: { baudRate?: number }): Promise<void> {
        // Update baudRate from options if provided
        if (options?.baudRate) {
            this.lastBaudRate = options.baudRate;
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: this.lastBaudRate });
            this.port = port;
            this.transport = new SerialTransport(port);
            this.commandHandler = new CommandHandler(this.transport);
            
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
                this.commandHandler = new CommandHandler(this.transport);
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
        
        this.commandHandler = null;
    }

    private startProcessing(): void {
        if (this.processingInterval !== null) {
            return;
        }
        
        this.processingInterval = window.setInterval(async () => {
            if (this.commandHandler) {
                try {
                    await this.commandHandler.processOnce();
                } catch (error: unknown) {
                    console.error("Error in processing interval:", error);
                    // If we encounter a fatal error, disconnect
                    if (error instanceof Error && error.message === 'Port is closed') {
                        this.disconnect();
                    }
                }
            }
        }, this.PROCESSING_INTERVAL_MS);
    }

    private stopProcessing(): void {
        if (this.processingInterval !== null) {
            window.clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    public async getVersion(): Promise<string> {
        if (!this.commandHandler) {
            throw new Error('Not connected');
        }
        const command = new GetVersion();
        await command.send(this.commandHandler);
        return `${command.major}.${command.minor}.${command.build}`;
    }

    public async listFolder(path: string): Promise<string[]> {
        if (!this.commandHandler) {
            throw new Error('Not connected');
        }
        const command = new ListFolder(path);
        await command.send(this.commandHandler);
        return command.files;
    }

    public isConnected(): boolean {
        return this.commandHandler !== null && this.port !== null;
    }
}

export default Device;