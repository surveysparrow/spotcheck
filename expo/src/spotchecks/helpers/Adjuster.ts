import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let AdjusterModule: any = null;
if (Platform.OS === 'android') {
  try {
    AdjusterModule = requireNativeModule('Adjuster');
  } catch {

    console.error('Adjuster module not found');
  }
}

export const Adjuster = {
  saveCurrentMode: (): void => AdjusterModule?.saveCurrentMode(),
  restoreSavedMode: (): void => AdjusterModule?.restoreSavedMode(),
  setAdjustNothing: (): void => AdjusterModule?.setAdjustNothing(),
};
