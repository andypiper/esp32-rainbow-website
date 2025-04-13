import DeviceContext from "./DeviceContext";
import DeviceContextType from "./DeviceContextType";

import { useContext } from "react";

const useDevice = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

export default useDevice;