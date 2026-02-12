import { Platform } from "react-native";
import { functionStore } from "../state/functionState";
import { spotcheckStore, updateState } from "../state/spotcheckState";
import { saveData, loadData } from "./storage";
import type { SsSpotcheckListener } from "./types";
import { captureP0Error, captureP1Error } from "./sentry";
import { Adjuster } from "./Adjuster";

// Save the host app's keyboard mode, then set ADJUST_NOTHING
const pauseDefaultKeyboardBehavior = () => {
  if (Platform.OS === 'android') {
    try {
      Adjuster.saveCurrentMode();
      Adjuster.setAdjustNothing();
    } catch {}
  }
};

const resumeDefaultKeyboardBehavior = () => {
  if (Platform.OS === 'android') {
    try {
      Adjuster.restoreSavedMode();
    } catch {}
  }
};

let spotcheckListener: SsSpotcheckListener = {};

export const setListener = (listener: SsSpotcheckListener) => {
  spotcheckListener = listener || {};
};

export const dispatchWrapper = (stateUpdate: any) => {
  try {
    spotcheckStore.dispatch(updateState(stateUpdate));
  } catch (error: any) {
    captureP1Error(error, 'GENERAL', {
      action: 'dispatchWrapper',
      errorMessage: error?.message,
    });
  }
};

export const execute = async (functionName: string, params?: any) => {
  let func: any;
  let payload: any;

  // Infrastructure: resolve function and build payload
  try {
    const functionState = functionStore.getState();

    if (!functionState.functionState.isLoaded) {
      return null;
    }

    const pathParts = functionName.split('.');
    let functionString = functionState.functionState;
    
    for (const part of pathParts) {
      functionString = functionString?.[part];
    }

    if (!functionString || typeof functionString !== 'string') {
      console.error(`Function ${functionName} not found`);
      return null;
    }

    payload = {
      params,
      state: spotcheckStore.getState(),
      dispatchWrapper,
      storage: { saveData, loadData },
      listener: spotcheckListener,
      sentry: { captureP0Error, captureP1Error },
      keyboard: { pauseDefaultKeyboardBehavior, resumeDefaultKeyboardBehavior },
    };

    func = eval(`(${functionString})`);
  } catch (error: any) {
    captureP1Error(error, 'GENERAL', {
      action: 'execute:setup',
      functionName,
      errorMessage: error?.message,
    });
    return null;
  }

  // Execution: run the backend function (has its own Sentry)
  try {
    const result = await func(payload);
    return result;
  } catch (error: any) {
    console.error("Error executing function:", error);
    return null;
  }
}
