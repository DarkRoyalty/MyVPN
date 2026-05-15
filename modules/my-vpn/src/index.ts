import { NativeModulesProxy } from 'expo-modules-core';

export interface VpnModuleInterface {
  connect(configUrl: string): Promise<string>;
  disconnect(): Promise<string>;
  getStatus(): Promise<boolean>;
}

export default NativeModulesProxy.MyVpnModule as VpnModuleInterface;
