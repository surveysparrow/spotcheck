import { requireNativeView } from 'expo';
import * as React from 'react';

import { SpotchecksViewProps } from './Spotchecks.types';

const NativeView: React.ComponentType<SpotchecksViewProps> =
  requireNativeView('Spotchecks');

export default function SpotchecksView(props: SpotchecksViewProps) {
  return <NativeView {...props} />;
}
