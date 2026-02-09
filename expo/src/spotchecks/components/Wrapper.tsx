import { Dimensions } from "react-native";

import { useSelector } from "react-redux";
import { SpotcheckState } from "../state/spotcheckState";
import { componentStore } from "../state/componentState";
import { Builder } from "./Builder";
import { execute } from "../helpers/executables";
import { useEffect, useState, useMemo } from "react";

export const Wrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const state = useSelector((state: SpotcheckState) => state.SpotCheckState);
  const screenHeight = Dimensions.get("window").height;
  
  const [styles, setStyles] = useState({
    overlayStyle: {
      height: 0,
      opacity: 0,
      zIndex: -999999,
    },
    wrapperStyle: {},
  });

  const [componentState, setComponentState] = useState(componentStore.getState().componentState);

  useEffect(() => {
    const unsubscribe = componentStore.subscribe(() => {
      setComponentState(componentStore.getState().componentState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    execute("wrapper.getWrapperStyles", { screenHeight, setStyles });
  }, [state.showSpotCheck, state.spotCheckDetails.isMounted, state.spotCheckDetails.currentQuestionHeight, state.spotCheckDetails.isExiting, state.spotCheckDetails.keyBoardHeight, state.spotCheckDetails.textPosition]);

  const wrapperSchema = componentState?.schemas?.wrapper;

  const context = useMemo(() => ({
    state,
    styles,
    slots: {
      children,
    },
  }), [state, styles, children]);

  if (wrapperSchema && componentState.isLoaded) {
    return <Builder schema={wrapperSchema} context={context} />;
  }

  if (!wrapperSchema || !componentState.isLoaded) {
    return null;
  }

  return null;

};
