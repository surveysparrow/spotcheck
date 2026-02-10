import React from "react";
import { View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";

export const WebViewRenderer = React.forwardRef<
  WebView,
  {
    uri: string;
    canShow: boolean;
    onMessage: (event: WebViewMessageEvent) => void;
    onError: (event: WebViewErrorEvent) => void;
    config?: any;
    scrollEnabled?: boolean;
  }
>(({ canShow, uri, onMessage, onError = () => { }, config, scrollEnabled = true }, ref) => {
  return uri ? (
    <View
      style={
        canShow
          ? {
            width: "100%",
            height: "100%",
          }
          : {
            width: 0,
            height: 0,
            opacity: 0,
          }
      }
    >
      <WebView
        ref={ref}
        source={{ uri }}
        scrollEnabled={scrollEnabled}
        {...config}
        onMessage={onMessage}
        onError={onError}
      />
    </View>
  ) : (
    <></>
  );
});
