import { combineReducers, configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getVisitorInfo } from '../helpers';

const initialState: any = {
  allSpotChecksInToken: [],
  customEventsSpotChecks: [],
  filteredSpotChecks: [],
  showSpotCheck: false,

  currentSpotcheck: {
    spotcheckURL: '',
    spotcheckID: 0,
    spotcheckContactID: 0,
    triggerToken: '',
    screenName: '',
    afterDelay: 0,
    isChat: false,
    appearance: {},
  },

  params: {
    targetToken: '',
    domainName: '',
    userDetails: {},
    variables: {},
    customProperties: {},
    visitor: getVisitorInfo(),
    userAgent: '',
    traceId: '',
  },

  spotCheckDetails: {
    keyBoardHeight: 0,
    textPosition: 0,
    isMounted: false,
    isVisible: false,
    isExiting: false,
    currentQuestionHeight: 0,
    miniCardHeight: 0,
    sideTabButtonWidth: 0,
    isFullScreenMode: false,
    spotCheckType: null,
    position: 'bottom',
    mode: '',
    closeButton: {
      isEnabled: false,
      color: "#000000",
      isMiniCard: false,
    },
    isSpotCheckButton: false,
    spotCheckButtonConfig: {},
    showSurveyContent: true,
    avatarEnabled: false,
    avatarUrl: '',
  },

  webViewDetails: {
    isChatEnabled: false,
    isClassicEnabled: false,
    isClassicLoading: true,
    isChatLoading: true,
    chatUrl: null,
    classicUrl: null,
    isCurrentSpotcheckChat: null,
    canShowClassic: false,
    canShowChat: false,
    webViewInjectionData: null,
    webViewConfig: {
      injectedJavaScript: `
        document.addEventListener('focusin', function(event) {
          if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            var rect = event.target.getBoundingClientRect();
            var yPosition = rect.y + window.scrollY;
            var webViewHeight = window.innerHeight;
            var scaledY = (yPosition / webViewHeight) * window.screen.height;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'position',
              y: scaledY
            }));
          }
        });

        window.flutterSpotCheckData = {
          postMessage: function(data) {
            window.ReactNativeWebView.postMessage(data);
          }
        };

        (function() {
          const observer = new MutationObserver((mutations, obs) => {
            const input = document.querySelector(".ss-language-selector__select__input input");
            if (input) {
              input.setAttribute("readonly", true);
            }
          });
      
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        })();
      `,
      webviewDebuggingEnabled: true,
      geolocationEnabled: true,
      mediaPlaybackRequiresUserAction: false,
      originWhitelist: ["*"],
      allowsInlineMediaPlayback: true,
      javaScriptEnabled: true,
      domStorageEnabled: true,
    },
    chatWebViewRef: null,
    classicWebViewRef: null,
  },
};


const spotcheckSlice = createSlice({
  name: 'SpotCheckState',
  initialState,
  reducers: {
    updateState(state, action: PayloadAction<Partial<any>>) {
      state = {
        ...state,
        ...action.payload,
        currentSpotcheck: {
          ...state.currentSpotcheck,
          ...(action.payload.currentSpotcheck || {}),
        },
        spotCheckDetails: {
          ...state.spotCheckDetails,
          ...(action.payload.spotCheckDetails || {}),
        },
        webViewDetails: {
          ...state.webViewDetails,
          ...(action.payload.webViewDetails || {}),
        },
        params: {
          ...state.params,
          ...(action.payload.params || {}),
        },
      };
      return state;
    },
  },
});

export const { updateState } = spotcheckSlice.actions;

const rootReducer = combineReducers({
  SpotCheckState: spotcheckSlice.reducer,
});

export const spotcheckStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type SpotcheckState = ReturnType<typeof spotcheckStore.getState>;

export type SpotcheckDispatch = typeof spotcheckStore.dispatch;