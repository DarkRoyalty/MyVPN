import { NativeModules } from 'react-native';

const { MyVpnModule } = NativeModules;

export interface VpnModuleInterface {
  connect(configUrl: string): Promise<string>;
  disconnect(): Promise<string>;
  getStatus(): Promise<boolean>;
}

export default MyVpnModule as VpnModuleInterface;
