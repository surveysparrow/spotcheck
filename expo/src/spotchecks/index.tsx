import React, { Component, ErrorInfo } from "react";
import { Provider } from "react-redux";
import WebViewComponent from "./components/WebViewComponent";
import { Wrapper } from "./components/Wrapper";
import { getAllSpotcheckFunctions, getUserAgent } from "./helpers";
import { CustomProperties, SpotcheckProps, UserDetails, Variables } from "./helpers/types";
import { spotcheckStore, updateState } from "./state/spotcheckState";
import { execute, setListener } from "./helpers/executables";
import { SpotCheckButton } from "./components/SpotCheckButton";
import { useSpotcheckNavigation } from "./helpers/NavigationHandler";
import { initializeSentry, captureP0Error } from "./helpers/sentry";

initializeSentry();

interface ErrorBoundaryState {
  hasError: boolean;
}

class SpotcheckErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureP0Error(error, 'APP_CRASH', {
      type: 'appCrash',
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const SpotCheckContent: React.FC = () => {
  useSpotcheckNavigation();

  return (
    <>
      <Wrapper>
        <WebViewComponent />
      </Wrapper>
      <SpotCheckButton />
    </>
  );
};

export const SpotCheck: React.FC = () => {
  return (
    <Provider store={spotcheckStore}>
      <SpotcheckErrorBoundary>
        <SpotCheckContent />
      </SpotcheckErrorBoundary>
    </Provider>
  );
};

export const initializeSpotChecks = async (params: SpotcheckProps) => {
  try {
    if (params.listener) {
      setListener(params.listener);
    }

    const userAgent = await getUserAgent();
    spotcheckStore.dispatch(updateState({ params: { userAgent } }));

    await getAllSpotcheckFunctions(params.domainName);
    execute("initializeSpotcheckComponent", params);
  } catch (error) {
    console.error("Error initializing spotchecks:", error);
    throw error;
  }
};

export const trackScreen = async (
  screen: string,
  options: {
    variables?: Variables;
    customProperties?: CustomProperties;
    userDetails?: UserDetails;
  } = {
    variables: {},
    customProperties: {},
    userDetails: {},
  }
) => {
  try {
    execute("trackScreen", { screen, options });
  } catch (error) {
    console.error("Error tracking screen:", error);
    throw error;
  }
};

export const trackEvent = async (
  screen: string,
  event: {
    [key: string]: any;
  } = {}
) => {
  try {
    execute("trackEvent", { screen, event });
  } catch (error) {
    console.error("Error tracking event:", error);
    throw error;
  }
};

export const onSpotcheckNavigationChange = () => {
  try {
    execute("handleNavigationChange");
  } catch (error) {
    console.error("Error handling navigation change:", error);
  }
};

export type {
  SpotcheckProps,
  SsSpotcheckListener,
  TrackEventProps,
  UserDetails,
  Variables,
  CustomProperties,
} from "./helpers/types";
