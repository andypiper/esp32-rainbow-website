import { GetVersion, VersionInfo } from "./Messages/GetVersion";
import { Transport, MessageHandler} from "./MessageHandler";
import { ListFolder } from "./Messages/ListFolder";
import { WriteFileStart } from "./Messages/WriteFileStart";
import { ReadFile } from "./Messages/ReadFile";
import { DeleteFile } from "./Messages/DeleteFile";
import { MakeDirectory } from "./Messages/MakeDirectory";
import { RenameFile } from "./Messages/RenameFile";
import { GetFileInfo } from "./Messages/GetFileInfo";
import { FileInfo } from "./Messages/ResponseTypes";
import { WriteFileData } from "./Messages/WriteFileData";
import { WriteFileEnd } from "./Messages/WriteFileEnd";

// Custom event type for disconnect events
export type DisconnectCallback = () => void;

class SerialTransport implements Transport {
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private writer: WritableStreamDefaultWriter<Uint8Array>;
    private isConnected = false;
    constructor(private port: SerialPort) {
        if (!this.port.readable || !this.port.writable) {
            throw new Error('Port is not readable or writable');
        }
        this.reader = this.port.readable.getReader();
        this.writer = this.port.writable.getWriter();
        this.isConnected = true;
    }

    public async read(): Promise<Uint8Array> {
        if (!this.isConnected) {
            console.log('Read: Not connected');
            return new Uint8Array();
        }
        // read a new chunk of data
        console.log('Reading');
        const result = await this.reader.read();
        if (result.done) {
            console.log('Read stream done');
            return new Uint8Array();
        }
        console.log(`Reading ${result.value.length} bytes`);
        // dump out the data as hex
        console.log("DEVICE:", Array.from(result.value).map(b => b.toString(16).padStart(2, '0')).join(' '));
        // dump out the data as ascii - replace non-printable characters with '.'
        console.log("DEVICE:", Array.from(result.value).map(b => b < 0x0a || b > 126 ? '.' : String.fromCharCode(b)).join(''));
        return result.value;
    }

    public async write(data: Uint8Array): Promise<void> {
        if (!this.isConnected) {
            console.log('Write:Not connected');
            return;
        }
        console.log('Writing', data.length, 'bytes');
        // dump out the data as hex
        console.log("CLIENT:", Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
        // dump out the data as ascii - replace non-printable characters with '.'
        console.log("CLIENT:", Array.from(data).map(b => b < 0x0a || b > 126 ? '.' : String.fromCharCode(b)).join(''));
        await this.writer.write(data);
        console.log('Wrote', data.length, 'bytes');
    }

    public async close(): Promise<void> {
        this.isConnected = false;
        await this.reader.cancel();
        await this.writer.close();
    }
}

class Device {
    private versionInfo: VersionInfo | null = null;
    private messageHandler: MessageHandler | null = null;
    private transport: SerialTransport | null = null;
    private port: SerialPort | null = null;
    private processingInterval: number | null = null;
    private readonly PROCESSING_INTERVAL_MS = 1; // 5ms interval for processing
    private lastBaudRate: number = 115200; // Store the last baud rate used
    private onDisconnectCallback: DisconnectCallback | null = null;

    constructor(options: { baudRate?: number, onDisconnect?: DisconnectCallback } = {}) {
        this.lastBaudRate = options.baudRate || 115200;
        this.onDisconnectCallback = options.onDisconnect || null;
    }

    public async connect(options?: { baudRate?: number, onDisconnect?: DisconnectCallback }): Promise<void> {
        // Update baudRate from options if provided
        if (options?.baudRate) {
            this.lastBaudRate = options.baudRate;
        }
        
        // Update disconnect callback if provided
        if (options?.onDisconnect) {
            this.onDisconnectCallback = options.onDisconnect;
        }

        try {
            const port = await navigator.serial.requestPort();
            // Set up disconnect listener
            port.addEventListener('disconnect', this.handleDisconnect);
            // need to open the port with these optiosn - 115200 8-N-1
            await port.open({ baudRate: this.lastBaudRate, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'none', bufferSize: 4096 });
            console.log('Port opened');
            this.port = port;
            this.transport = new SerialTransport(port);
            this.messageHandler = new MessageHandler(this.transport);
            
            // Start processing data
            this.startProcessing();

            // get the version info
            // this.versionInfo = await this.getVersion();
            // console.log('Version info:', this.versionInfo);
        } catch (error) {
            console.error("Failed to connect:", error);
            await this.disconnect();
            throw error;
        }
    }

    // Handler for disconnect events
    private handleDisconnect = (): void => {
        console.log('Device disconnected');
        // Clean up resources
        this.stopProcessing();
        this.messageHandler = null;
        this.transport = null;
        
        // Notify application about disconnection
        if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
        }
    }

    public async disconnect(): Promise<void> {
        if (this.port) {
            console.log('Removing disconnect event listener');
            // Remove the disconnect event listener
            this.port.removeEventListener('disconnect', this.handleDisconnect);
        }
        
        if (this.transport) {
            console.log('Closing transport');
            try {
                await this.transport.close();
            } catch (error) {
                console.error("Error closing transport:", error);
            }
            this.transport = null;
        }
        
        if (this.port) {
            console.log('Closing port');
            try {
                await this.port.close();
            } catch (error) {
                console.error("Error closing port:", error);
            }
            this.port = null;
        }
        
        this.messageHandler = null;

        // Notify application about disconnection
        if (this.onDisconnectCallback) {
            console.log('Calling onDisconnectCallback');
            this.onDisconnectCallback();
        }
        this.stopProcessing();
    }

    // Set a new disconnect callback
    public setOnDisconnect(callback: DisconnectCallback | null): void {
        this.onDisconnectCallback = callback;
    }

    // Check if the port is still connected
    public isDeviceConnected(): boolean {
        return this.port?.connected ?? false;
    }

    private startProcessing(): void {
        if (!this.isConnected) {
            console.log('StartProcessing: Not connected');
            return;
        }
        if (this.processingInterval !== null) {
            console.log('Processing already started');
            return;
        }

        this.processingInterval = window.setTimeout(async () => {
            if (this.messageHandler) {
                try {
                    await this.messageHandler.processOnce();
                    // schedule the next processing interval
                    this.processingInterval = null;
                    this.startProcessing();
                } catch (error: unknown) {
                    console.error("Error in processing interval:", error);
                    await this.disconnect();
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

    public async getVersion(): Promise<VersionInfo> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new GetVersion();
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to get version');
        }

        if (!message.versionInfo) {
            throw new Error('No version info received');
        }
        
        return message.versionInfo;
    }

    public async listFolder(path: string): Promise<FileInfo[]> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new ListFolder(path);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to list folder');
        }
        
        return message.files;
    }

    public async writeFile(path: string, data: Uint8Array, onProgress?: (progress: number) => void): Promise<boolean> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Writing file', path, data.length, 'bytes');
        const message = new WriteFileStart(path, data);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to start writing file');
        }

        // now send the data in chunks of 16000 bytes
        for (let i = 0; i < data.length; i += 16000) {
            const chunk = data.slice(i, i + 16000);
            const message = new WriteFileData(path, chunk);
            await message.send(this.messageHandler);
            if (!message.success) {
                throw new Error(message.error || 'Failed to write file data');
            }
            if (onProgress) {
                onProgress(100 *i / data.length);
            }
        }

        // now send the end of the file
        const endMessage = new WriteFileEnd(path, data);
        await endMessage.send(this.messageHandler);
        if (!endMessage.success) {
            throw new Error(endMessage.error || 'Failed to end writing file');
        }
        if (onProgress) {
            onProgress(100);
        }
        return true;
    }

    public async readFile(path: string): Promise<Uint8Array> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        const message = new ReadFile(path);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to read file');
        }
        
        return message.result;
    }
    
    public async deleteFile(path: string): Promise<string> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Deleting file', path);
        const message = new DeleteFile(path);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to delete file');
        }
        
        return message.result;
    }
    
    public async makeDirectory(path: string): Promise<string> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Creating directory', path);
        const message = new MakeDirectory(path);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to create directory');
        }
        
        return message.result;
    }
    
    public async renameFile(sourcePath: string, destinationPath: string): Promise<string> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Renaming', sourcePath, 'to', destinationPath);
        const message = new RenameFile(sourcePath, destinationPath);
        await message.send(this.messageHandler);
        
        if (!message.success) {
            throw new Error(message.error || 'Failed to rename file');
        }
        
        return message.result;
    }
    
    public async getFileInfo(path: string): Promise<FileInfo> {
        if (!this.messageHandler) {
            throw new Error('Not connected');
        }
        console.log('Getting file info for', path);
        const message = new GetFileInfo(path);
        await message.send(this.messageHandler);
        
        if (!message.success || message.error) {
            throw new Error(message.error || 'Failed to get file info');
        }
        
        if (!message.fileInfo) {
            throw new Error('No file info received');
        }
        
        return message.fileInfo;
    }
    
    public isConnected(): boolean {
        return this.messageHandler !== null && this.port !== null;
    }

    public async reconnect(): Promise<void> {
        console.log('Reconnecting');
        // Disconnect first if already connected
        if (this.isConnected()) {
            await this.disconnect();
        }
        
        // Try to reconnect using the last port if available
        try {
            // If we have a port saved, we can try to reconnect to the same port
            if (this.port) {
                // Set up disconnect listener again
                this.port.addEventListener('disconnect', this.handleDisconnect);
                
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
}

export default Device;