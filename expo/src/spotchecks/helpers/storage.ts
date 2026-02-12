import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import { captureP1Error } from './sentry';

const generateTraceId = () => {
  const uuidString = uuid.v4();
  const timestamp = Date.now();
  return `${uuidString}-${timestamp}`;
};

export const saveData = async (value: string) => {
  try {
    await SecureStore.setItemAsync('SurveySparrowUUID', value);
  } catch (error: any) {
    captureP1Error(error, 'GENERAL', {
      action: 'saveData',
      errorMessage: error?.message,
    });
  }
};

export const loadData = async (isuuid: boolean = false) => {
  try {
    if (isuuid) {
      return generateTraceId();
    } else {
      return await SecureStore.getItemAsync('SurveySparrowUUID');
    }
  } catch (error: any) {
    captureP1Error(error, 'GENERAL', {
      action: 'loadData',
      isuuid,
      errorMessage: error?.message,
    });
    return null;
  }
};
