// Sentry as error enrichment engine — errors route to SurveySparrow's API, not Sentry servers.
// All Sentry imports are optional — SDK works without @sentry/* packages.

import { spotcheckStore } from '../state/spotcheckState';


let ReactNativeClient: any = null;
let Scope: any = null;
let dedupeIntegration: any = null;
let functionToStringIntegration: any = null;
let inboundFiltersIntegration: any = null;
let defaultStackParser: any = null;
let makeFetchTransport: any = null;
let httpContextIntegration: any = null;
let breadcrumbsIntegration: any = null;
let deviceContextIntegration: any = null;
let reactNativeInfoIntegration: any = null;
let nativeReleaseIntegration: any = null;
let eventOriginIntegration: any = null;
let sdkInfoIntegration: any = null;
let expoContextIntegration: any = null;

let isSentryAvailable = false;

try {
  const sentryReactNative = require('@sentry/react-native');
  ReactNativeClient = sentryReactNative.ReactNativeClient;
  deviceContextIntegration = sentryReactNative.deviceContextIntegration;
  reactNativeInfoIntegration = sentryReactNative.reactNativeInfoIntegration;
  nativeReleaseIntegration = sentryReactNative.nativeReleaseIntegration;
  eventOriginIntegration = sentryReactNative.eventOriginIntegration;
  sdkInfoIntegration = sentryReactNative.sdkInfoIntegration;
  expoContextIntegration = sentryReactNative.expoContextIntegration;

  const sentryCore = require('@sentry/core');
  Scope = sentryCore.Scope;
  dedupeIntegration = sentryCore.dedupeIntegration;
  functionToStringIntegration = sentryCore.functionToStringIntegration;
  inboundFiltersIntegration = sentryCore.inboundFiltersIntegration;

  const sentryReact = require('@sentry/react');
  defaultStackParser = sentryReact.defaultStackParser;
  makeFetchTransport = sentryReact.makeFetchTransport;
  httpContextIntegration = sentryReact.httpContextIntegration;
  breadcrumbsIntegration = sentryReact.breadcrumbsIntegration;

  isSentryAvailable = true;
} catch (e) {
  isSentryAvailable = false;
}

let sdkScope: any = null;
let sdkClient: any = null;

export const initializeSentry = () => {
  if (!isSentryAvailable) {
    return;
  }

  if (sdkScope && sdkClient) return;
  
  try {
    const client = new ReactNativeClient({
      dsn: 'https://dummy@sentry.io/0',
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      enableNative: true,
      enableAutoSessionTracking: false,
      integrations: [
        inboundFiltersIntegration(),
        functionToStringIntegration(),
        breadcrumbsIntegration(),
        dedupeIntegration(),
        httpContextIntegration(),
        deviceContextIntegration(),
        nativeReleaseIntegration(),
        eventOriginIntegration(),
        sdkInfoIntegration(),
        reactNativeInfoIntegration(),
        expoContextIntegration(),
      ],
      beforeSend: async (event: any) => {
        // Normalize raw Sentry event into platform-agnostic structure
        const normalizedEvent = {
          errorMessage:
            event.message ||
            event.exception?.values?.[0]?.value ||
            'Unknown error',
          tags: event.tags || {},
          contexts: event.contexts || {},
          breadcrumbs: event.breadcrumbs,
          exceptions: event.exception?.values?.map((e: any) => ({
            type: e.type,
            value: e.value,
            stacktrace: e.stacktrace?.frames?.slice(-10),
          })),
          eventId: event.event_id,
          timestamp: event.timestamp,
          platform: event.platform,
          release: event.release,
          environment: event.environment,
          sdk: event.sdk,
        };

        // Lazy require to break circular dependency (sentry <-> executables)
        const { execute } = require('./executables');
        const result = await execute('sentry.processSentryError', {
          event: normalizedEvent,
          sdkType: 'react-native',
          sdkVersion: '1.0.0',
        });

        // Fallback: if backend functions not loaded yet, send directly
        if (!result) {
          const domainName = spotcheckStore.getState().SpotCheckState?.params?.domainName;
          if (domainName) {
            fetch(`https://${domainName}/api/internal/spotcheck/sdkErrors`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                errorMessage: normalizedEvent.errorMessage,
                sdkType: 'react-native',
                sdkVersion: '1.0.0',
                tags: {
                  ...normalizedEvent.tags,
                  error_priority: 'P0',
                  severity: 'CRITICAL',
                  errorType: 'ATOMIC_FUNCTION_ERROR',
                },
              }),
            }).catch(() => {});
          }
        }

        return null;
      },
    });

    client.init();

    const scope = new Scope();
    scope.setClient(client);

    sdkClient = client;
    sdkScope = scope;
  } catch (e) {
    isSentryAvailable = false;
  }
};

export type ErrorSource =
  | 'SDK_INITIALIZATION'
  | 'SPOTCHECK_INITIALIZATION'
  | 'TRACK_SCREEN'
  | 'TRACK_EVENT'
  | 'WEBVIEW_ERROR'
  | 'CLOSE_SPOTCHECK'
  | 'APP_CRASH'
  | 'GENERAL';

export const captureP0Error = (
  error: Error | unknown,
  source: ErrorSource,
  extra?: Record<string, any>
) => {
  if (!isSentryAvailable) return;

  if (!sdkScope || !sdkClient) {
    initializeSentry();
  }

  if (sdkScope) {
    const eventScope = sdkScope.clone();
    eventScope.setTag('error_priority', 'P0');
    eventScope.setTag('severity', 'CRITICAL');
    eventScope.setTag('errorType', source);

    if (extra) {
      Object.entries(extra).forEach(([k, v]: [string, any]) => {
        eventScope.setExtra(k, v);
      });
    }
    
    eventScope.captureException(error);
  }
};

export const captureP1Error = (
  error: Error | unknown,
  source: ErrorSource,
  extra?: Record<string, any>
) => {
  if (!isSentryAvailable) return;

  if (!sdkScope || !sdkClient) {
    initializeSentry();
  }

  if (sdkScope) {
    const eventScope = sdkScope.clone();
    eventScope.setTag('error_priority', 'P1');
    eventScope.setTag('severity', 'HIGH');
    eventScope.setTag('errorType', source);

    if (extra) {
      Object.entries(extra).forEach(([k, v]: [string, any]) => {
        eventScope.setExtra(k, v);
      });
    }

    eventScope.captureException(error);
  }
};
