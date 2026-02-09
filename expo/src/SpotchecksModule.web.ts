import { registerWebModule, NativeModule } from 'expo';

import { SpotchecksModuleEvents } from './Spotchecks.types';

class SpotchecksModule extends NativeModule<SpotchecksModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(SpotchecksModule, 'SpotchecksModule');
