import { NativeModule, requireNativeModule } from 'expo';

import { SpotchecksModuleEvents } from './Spotchecks.types';

declare class SpotchecksModule extends NativeModule<SpotchecksModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<SpotchecksModule>('Spotchecks');
