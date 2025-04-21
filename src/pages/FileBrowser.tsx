import { useState, useEffect } from 'react';
import useDevice from '../context/useDevice';
import StorageFileBrowser from '../components/StorageFileBrowser';
import { STORAGE_TYPE } from '../device/Device';

export default function FileBrowserPage() {
  const { isConnected, versionInfo, connect, getVersion } = useDevice();
  const [activeTab, setActiveTab] = useState<STORAGE_TYPE>('flash');
  const [checkedVersion, setCheckedVersion] = useState(false);

  // Fetch version info on mount if not already available
  useEffect(() => {
    if (isConnected && !versionInfo && !checkedVersion) {
      setCheckedVersion(true);
      getVersion().catch(() => { });
    }
  }, [isConnected, versionInfo, getVersion, checkedVersion]);

  // UI
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">ESP32 Rainbow File Browser</h2>
        <p className="mb-4">Connect your ESP32 Rainbow device to browse files on Flash and SD Card.</p>
        <button
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold"
          onClick={() => connect()}
        >
          Connect Device
        </button>
      </div>
    );
  }

  if (!versionInfo) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow text-center">
        <span>Loading device information...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">ESP32 Rainbow File Browser - Drop files to upload</h2>
      <div className="mb-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'flash' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('flash')}
          disabled={!versionInfo.flash.available}
        >
          Flash Storage
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'sd' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('sd')}
          disabled={!versionInfo.sd.available}
        >
          SD Card
        </button>
      </div>
      
      <StorageFileBrowser 
        storageType="flash" 
        active={activeTab === 'flash'} 
      />
      
      <StorageFileBrowser 
        storageType="sd" 
        active={activeTab === 'sd'} 
      />
    </div>
  );
} 