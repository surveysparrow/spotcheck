import * as React from 'react';

import { SpotchecksViewProps } from './Spotchecks.types';

export default function SpotchecksView(props: SpotchecksViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
