import Device from '../device/Device';
import { VersionInfo } from '../device/Messages/GetVersion';

interface DeviceContextType {
  device: Device;
  isConnected: boolean;
  isAvailable: boolean;
  versionInfo: VersionInfo | null;
  connect: (options?: { baudRate?: number }) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  getVersion: () => Promise<VersionInfo>;
}

export default DeviceContextType;