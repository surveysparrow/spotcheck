import { Dimensions, Platform } from "react-native";
import { VisitorInfo } from "./types";
import axios from 'axios';
import { functionStore, updateState as updateFunctionState } from '../state/functionState';
import { componentStore, updateState as updateComponentState } from '../state/componentState';
import { captureP0Error } from './sentry';

export const getVisitorInfo = (): VisitorInfo => {
  const { width, height } = Dimensions.get("window");

  return {
    deviceType: "MOBILE",
    operatingSystem: Platform.OS === "ios" ? "iOS" : "Android",
    screenResolution: {
      width: Math.round(width),
      height: Math.round(height),
    },
    currentDate: new Date(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const getUserAgent = async (): Promise<string> => {
  let userAgent = 'Mozilla/5.0 ';
  try {
    const DeviceInfo = require('react-native-device-info').default;
    const isTabletDevice = DeviceInfo.isTablet();

    if (Platform.OS === 'android') {
      userAgent += `(Linux; Android ${Platform.Version}; ${isTabletDevice ? 'Tablet' : 'Mobile'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36`;
    } else if (Platform.OS === 'ios') {
      userAgent += `(${await DeviceInfo.getDeviceName()} - ${DeviceInfo.getModel()} CPU iOS ${String(Platform.Version).replace(/\./g, '_')} like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/537.36`;
    }
  } catch {
    // Fallback if react-native-device-info is not installed
    const version = String(Platform.Version);
    if (Platform.OS === 'android') {
      userAgent += `(Linux; Android ${version}; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36`;
    } else {
      userAgent += `(iPhone; CPU iPhone OS ${version.replace(/\./g, '_')} like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/537.36`;
    }
  }
  return userAgent;
};

export const getAllSpotcheckFunctions = async (domainName: string) => {
  try {
    const response = await axios.get(`https://${domainName}/api/internal/spotcheck/mobile/init`);
    
    const { componentSchemas, ...functions } = response.data;
    
    functionStore.dispatch(updateFunctionState({ ...functions, isLoaded: true }));
    
    if (componentSchemas) {
      componentStore.dispatch(updateComponentState({ 
        schemas: componentSchemas,
        isLoaded: true 
      }));
    }
    
    return response.data;
  } catch (error: any) {
    captureP0Error(error, 'SPOTCHECK_INITIALIZATION', {
      component: 'getAllSpotcheckFunctions',
      action: 'fetchFunctions',
      domainName,
      errorMessage: error?.message,
    });
    console.error('Error fetching spotcheck functions:', error);
    throw error;
  }
}
