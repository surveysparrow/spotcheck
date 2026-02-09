import { useLayoutEffect, useRef } from 'react';
import { execute } from '../helpers/executables';
import { captureP1Error } from '../helpers/sentry';

function useSafeNavigation() {
  try {
    const { useSegments } = require('expo-router');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSegments();
  } catch (error) {
    return null;
  }
}

export function useSpotcheckNavigation() {
  const segments = useSafeNavigation();
  const previousRoute = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useLayoutEffect(() => {
    if (!segments) {
      return;
    }
    
    try {
      const currentRoute = segments.join('/');

      if (!hasInitialized.current) {
        previousRoute.current = currentRoute;
        hasInitialized.current = true;
        return;
      }

      if (
        currentRoute !== previousRoute.current &&
        previousRoute.current !== null
      ) {
        execute('handleNavigationChange');
      }

      previousRoute.current = currentRoute;
    } catch (error: any) {
      captureP1Error(error, 'GENERAL', {
        action: 'navigationListener',
        errorMessage: error?.message,
      });
      console.error('Spotcheck: Navigation listener failed', error);
    }
  }, [segments]);
}
