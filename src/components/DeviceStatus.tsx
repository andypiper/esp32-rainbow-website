import { useState, useRef, useEffect } from 'react';
import useDevice from '../context/useDevice';

export default function DeviceStatus() {
  const { isAvailable, isConnected, connect, disconnect, versionInfo } = useDevice();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };
    
    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  const handleToggleConnection = async () => {
    if (!isAvailable) {
      alert('Web Serial is not supported in this browser. Please use Chrome, Edge, or another compatible browser.');
      return;
    }
    
    if (!isConnected) {
      try {
        setIsConnecting(true);
        await connect();
      } catch (error) {
        console.error('Error connecting:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // If connected, toggle details instead of disconnecting
      setShowDetails(!showDetails);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDetails(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleConnection}
        disabled={isConnecting}
        className={`relative flex items-center px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          !isAvailable 
            ? 'bg-gray-600 cursor-help' 
            : 'bg-gray-800 hover:bg-gray-700'
        }`}
        title={
          !isAvailable 
            ? 'Web Serial is not supported in this browser. Please use Chrome, Edge, or another compatible browser.'
            : isConnected 
              ? 'Connected to device - Click for details' 
              : 'Not connected - Click to connect'
        }
      >
        {/* Device icon */}
        <div className="relative">
          <svg 
            className={`w-5 h-5 ${!isAvailable ? 'text-gray-400' : 'text-gray-300'}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="2" x2="9" y2="4"></line>
            <line x1="15" y1="2" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="22"></line>
            <line x1="15" y1="20" x2="15" y2="22"></line>
            <line x1="20" y1="9" x2="22" y2="9"></line>
            <line x1="20" y1="15" x2="22" y2="15"></line>
            <line x1="2" y1="9" x2="4" y2="9"></line>
            <line x1="2" y1="15" x2="4" y2="15"></line>
          </svg>
          
          {/* Status indicator dot */}
          <span 
            className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border border-gray-900 ${
              isConnecting 
                ? 'bg-yellow-500' 
                : isConnected 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`}
          >
            {/* Pulsing animation for connecting state */}
            {isConnecting && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            )}
          </span>
        </div>
        
        {/* Status text */}
        <span className={`ml-2 text-sm font-medium ${
          !isAvailable
            ? 'text-gray-400'
            : isConnected 
              ? 'text-green-400' 
              : 'text-gray-300'
        }`}>
          {isConnecting 
            ? 'Connecting...' 
            : isConnected 
              ? 'Connected' 
              : 'Connect'
          }
        </span>
      </button>

      {/* Version info popup with disconnect button */}
      {showDetails && isConnected && versionInfo && (
        <div 
          ref={popupRef}
          className="absolute top-full right-0 mt-1 p-3 bg-gray-800 rounded-md shadow-lg text-xs flex flex-col gap-2 z-10 min-w-[180px]"
        >
          <div className="text-gray-300 font-medium border-b border-gray-700 pb-1 mb-1">Device Information</div>
          <div className="flex justify-between">
            <span className="text-gray-400">Firmware:</span>
            <span className="text-green-400">{versionInfo.firmwareVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Hardware:</span>
            <span className="text-blue-400">{versionInfo.hardwareVersion}</span>
          </div>
          
          <button 
            onClick={handleDisconnect}
            className="mt-2 w-full text-center py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded transition-colors text-xs"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 