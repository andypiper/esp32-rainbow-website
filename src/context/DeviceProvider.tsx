import React, { ReactNode, useState, useEffect } from 'react';
import Device from '../device/Device';
import DeviceContext from './DeviceContext';
import { VersionInfo } from '../device/Messages/GetVersion';

interface DeviceProviderProps {
  children: ReactNode;
}

const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  // Create device without callback initially
  const [device] = useState<Device>(() => new Device());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  // Check if serial communication is available
  useEffect(() => {
    setIsAvailable('serial' in navigator);
  }, []);

  // Update connection status whenever it changes
  useEffect(() => {
    // Check initial connection status
    setIsConnected(device.isConnected());
    
    // Set up the disconnect callback
    device.setOnDisconnect(() => {
      setIsConnected(false);
      setVersionInfo(null);
    });
    
    // Clean up on unmount
    return () => {
      device.setOnDisconnect(null);
    };
  }, [device]);

  const connect = async (options?: { baudRate?: number }): Promise<void> => {
    try {
      await device.connect({
        ...options,
        onDisconnect: () => {
          setIsConnected(false);
          setVersionInfo(null);
        }
      });
      setIsConnected(true);
      
      // Get version info after successful connection
      try {
        const info = await device.getVersion();
        setVersionInfo(info);
      } catch (error) {
        console.error('Failed to get version info:', error);
      }
    } catch (error) {
      console.error('Failed to connect to device:', error);
      setIsConnected(false);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      await device.disconnect();
    } finally {
      setIsConnected(false);
      setVersionInfo(null);
    }
  };

  const reconnect = async (): Promise<void> => {
    try {
      // Use the device's reconnect method now that it's implemented
      await device.reconnect();
      setIsConnected(true);
      
      // Get version info after successful reconnection
      try {
        const info = await device.getVersion();
        setVersionInfo(info);
      } catch (error) {
        console.error('Failed to get version info:', error);
      }
    } catch (error) {
      console.error('Failed to reconnect to device:', error);
      setIsConnected(false);
      throw error;
    }
  };

  const getVersion = async (): Promise<VersionInfo> => {
    if (!isConnected) {
      throw new Error('Not connected to device');
    }
    
    try {
      const info = await device.getVersion();
      setVersionInfo(info);
      return info;
    } catch (error) {
      console.error('Failed to get version info:', error);
      throw error;
    }
  };

  const value = {
    device,
    isConnected,
    connect,
    disconnect,
    reconnect,
    isAvailable,
    versionInfo,
    getVersion
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}; 

export default DeviceProvider;