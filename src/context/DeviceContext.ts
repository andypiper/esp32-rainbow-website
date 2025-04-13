import { createContext } from 'react';
import DeviceContextType from './DeviceContextType';

const DeviceContext = createContext<DeviceContextType | null>(null);

export default DeviceContext;
