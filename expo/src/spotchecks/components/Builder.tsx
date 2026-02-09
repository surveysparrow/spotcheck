import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  Image, 
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  UIManager,
  Platform
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebViewRenderer } from './WebViewRenderer';
import { componentRegistry } from './ComponentRegistry';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseButton } from './CloseButton';
import { SpotCheckButton } from './SpotCheckButton';
import { execute } from '../helpers/executables';
import { captureP1Error } from '../helpers/sentry';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SchemaNode {
  type: string;
  props?: Record<string, any>;
  children?: SchemaNode[];
  if?: any;
  slot?: string;
  component?: string;
  content?: any;
  animation?: {
    enter?: AnimationConfig;
    exit?: ExitAnimationConfig;
    layout?: LayoutAnimationConfig;
  };
}

interface AnimationConfig {
  if?: any;
  trigger?: any;
  type: 'timing' | 'spring';
  duration?: number;
  from?: {
    opacity?: number;
    translateY?: number | { $expr: string };
    translateX?: number | { $expr: string };
    scale?: number | { $expr: string };
  };
  to?: {
    opacity?: number;
    translateY?: number;
    translateX?: number;
    scale?: number;
  };
  transformOrigin?: string | { $expr: string };
  useNativeDriver?: boolean;
  easing?: string;
}

interface ExitAnimationConfig {
  type: 'timing' | 'spring';
  duration?: number;
  trigger?: any;
  to?: {
    opacity?: number;
    translateY?: number | { $expr: string };
    translateX?: number | { $expr: string };
    scale?: number | { $expr: string };
  };
  transformOrigin?: string | { $expr: string };
  onComplete?: string;
  useNativeDriver?: boolean;
  easing?: string;
}

interface LayoutAnimationConfig {
  if?: any;
  type: 'layoutAnimation' | 'height';
  duration?: number;
  trigger?: any;
  easing?: string;
}

interface BuilderContext {
  state?: any;
  styles?: any;
  slots?: Record<string, React.ReactNode>;
  handlers?: Record<string, (...args: any[]) => void>;
}

interface BuilderProps {
  schema: SchemaNode | SchemaNode[] | null;
  context: BuilderContext;
}

componentRegistry.register('View', View);
componentRegistry.register('TouchableOpacity', TouchableOpacity);
componentRegistry.register('Text', Text);
componentRegistry.register('ScrollView', ScrollView);
componentRegistry.register('Image', Image);
componentRegistry.register('FlatList', FlatList);
componentRegistry.register('TextInput', TextInput);
componentRegistry.register('ActivityIndicator', ActivityIndicator);
componentRegistry.register('Modal', Modal);
componentRegistry.register('Pressable', Pressable);
componentRegistry.register('SafeAreaView', SafeAreaView);
componentRegistry.register('CloseButton', CloseButton);
componentRegistry.register('SpotCheckButton', SpotCheckButton);
componentRegistry.register('SvgXml', SvgXml);
componentRegistry.register('WebViewRenderer', WebViewRenderer as any);

const evaluateExpression = (expr: string, context: BuilderContext): any => {
  try {
    const safeContext = {
      state: context.state,
      styles: context.styles,
      Math: Math,
    };
    
    const func = new Function(...Object.keys(safeContext), `return ${expr}`);
    return func(...Object.values(safeContext));
  } catch (error: any) {
    captureP1Error(error, 'WEBVIEW_ERROR', {
      action: 'evaluateExpression',
      expression: expr?.substring(0, 200),
      errorMessage: error?.message,
    });
    if (expr.includes('translateY')) return 0;
    if (expr.includes('scale')) return 1;
    if (expr.includes('opacity')) return 1;
    return undefined;
  }
};

const resolveBinding = (value: any, context: BuilderContext): any => {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((item) => resolveBinding(item, context));
    }

    if (value.$expr) {
      return evaluateExpression(value.$expr, context);
    }

    if (value.$ref) {
      const path = value.$ref.split('.');
      let result = context;
      for (const key of path) {
        result = result?.[key as keyof BuilderContext];
      }
      return result;
    }
    
    if (value.$path) {
      const path = value.$path.split('.');
      let result = context.state;
      for (const key of path) {
        result = result?.[key];
      }
      return result;
    }

    if (value.$handler && context.handlers) {
      return context.handlers[value.$handler];
    }

    if (value.$handlers && Array.isArray(value.$handlers) && context.handlers) {
      return (...args: any[]) => {
        value.$handlers.forEach((handlerName: string) => {
          const handler = context.handlers?.[handlerName];
          if (handler) {
            handler(...args);
          }
        });
      };
    }

    const resolved: Record<string, any> = {};
    for (const key in value) {
      resolved[key] = resolveBinding(value[key], context);
    }
    return resolved;
  }
  
  return value;
};

const evaluateCondition = (condition: any, context: BuilderContext): boolean => {
  if (!condition) return true;
  
  if (typeof condition === 'object' && !Array.isArray(condition)) {
    if (condition.$and && Array.isArray(condition.$and)) {
      return condition.$and.every((cond: any) => evaluateCondition(cond, context));
    }
    
    if (condition.$or && Array.isArray(condition.$or)) {
      return condition.$or.some((cond: any) => evaluateCondition(cond, context));
    }
    
    if (condition.$not !== undefined) {
      return !evaluateCondition(condition.$not, context);
    }
    
    if (condition.$eq && Array.isArray(condition.$eq) && condition.$eq.length === 2) {
      const [left, right] = condition.$eq.map((val: any) => resolveBinding(val, context));
      return left === right;
    }
    
    if (condition.$ne && Array.isArray(condition.$ne) && condition.$ne.length === 2) {
      const [left, right] = condition.$ne.map((val: any) => resolveBinding(val, context));
      return left !== right;
    }

    if (condition.$gt && Array.isArray(condition.$gt) && condition.$gt.length === 2) {
      const [left, right] = condition.$gt.map((val: any) => resolveBinding(val, context));
      return left > right;
    }

    if (condition.$lt && Array.isArray(condition.$lt) && condition.$lt.length === 2) {
      const [left, right] = condition.$lt.map((val: any) => resolveBinding(val, context));
      return left < right;
    }
  }
  
  const resolved = resolveBinding(condition, context);
  return Boolean(resolved);
};

const getEasingMap = () => {
  const Easing = require('react-native').Easing;
  return {
    'linear': Easing.linear,
    'ease': Easing.ease,
    'easeIn': Easing.in(Easing.ease),
    'easeOut': Easing.out(Easing.ease),
    'easeInOut': Easing.inOut(Easing.ease),
    'easeInEaseOut': Easing.inOut(Easing.ease),
  } as Record<string, any>;
};

const AnimatedComponent: React.FC<{
  animation?: SchemaNode['animation'];
  context: BuilderContext;
  Component: any;
  componentProps: any;
  children: React.ReactNode;
  componentKey: string;
}> = ({ animation, context, Component, componentProps, children, componentKey }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const exitAnimatedValue = useRef(new Animated.Value(0)).current;
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);
  const prevExitTrigger = useRef(false);
  const [isExitAnimating, setIsExitAnimating] = useState(false);

  const enterConfig = animation?.enter;
  const animationTrigger = enterConfig?.trigger ? evaluateCondition(enterConfig.trigger, context) : true;

  useEffect(() => {
    if (!enterConfig || !animationTrigger) return;

    animatedValue.setValue(0);
    const easingMap = getEasingMap();
    const Easing = require('react-native').Easing;
    const easingFunc = easingMap[enterConfig.easing || 'easeOut'] || Easing.out(Easing.ease);
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: enterConfig.duration || 600,
      easing: easingFunc,
      useNativeDriver: enterConfig.useNativeDriver !== false,
    }).start();
  }, [animationTrigger]);

  const exitConfig = animation?.exit;
  const exitTrigger = exitConfig?.trigger ? evaluateCondition(exitConfig.trigger, context) : false;

  useEffect(() => {
    if (!exitConfig) return;

    if (exitTrigger && !prevExitTrigger.current) {
      setIsExitAnimating(true);
      exitAnimatedValue.setValue(0);

      const easingMap = getEasingMap();
      const Easing = require('react-native').Easing;
      const easingFunc = easingMap[exitConfig.easing || 'easeIn'] || Easing.in(Easing.ease);

      Animated.timing(exitAnimatedValue, {
        toValue: 1,
        duration: exitConfig.duration || 300,
        easing: easingFunc,
        useNativeDriver: exitConfig.useNativeDriver !== false,
      }).start(() => {
        setIsExitAnimating(false);
        if (exitConfig.onComplete) {
          execute(exitConfig.onComplete);
        }
      });
    }

    prevExitTrigger.current = exitTrigger;
  }, [exitTrigger]);

  const layoutConfig = animation?.layout;
  const shouldAnimateLayout = layoutConfig && layoutConfig.type === 'height' && (!layoutConfig.if || evaluateCondition(layoutConfig.if, context));
  const currentHeight = componentProps?.style?.height;

  useEffect(() => {
    if (!shouldAnimateLayout || currentHeight === undefined || currentHeight === 0) return;
    
    if (isFirstRender.current) {
      animatedHeight.setValue(currentHeight);
      isFirstRender.current = false;
      return;
    }
    
    const easingMap = getEasingMap();
    const Easing = require('react-native').Easing;
    const easingFunc = easingMap[layoutConfig.easing || 'easeInEaseOut'] || Easing.inOut(Easing.ease);
    
    Animated.timing(animatedHeight, {
      toValue: currentHeight,
      duration: layoutConfig.duration || 300,
      easing: easingFunc,
      useNativeDriver: false,
    }).start();
  }, [currentHeight]);

  const getEnterAnimatedStyle = () => {
    if (!enterConfig?.from || !enterConfig?.to) return {};

    const from = enterConfig.from;
    const to = enterConfig.to;
    const transform: any[] = [];
    let style: any = {};

    const fromOpacity = resolveBinding(from.opacity, context);
    const fromTranslateY = resolveBinding(from.translateY, context);
    const fromTranslateX = resolveBinding(from.translateX, context);
    const fromScale = resolveBinding(from.scale, context);

    if (fromOpacity !== undefined && to.opacity !== undefined) {
      style.opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [fromOpacity, to.opacity],
      });
    }

    if (fromTranslateY !== undefined && to.translateY !== undefined) {
      transform.push({
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [fromTranslateY, to.translateY],
        }),
      });
    }

    if (fromTranslateX !== undefined && to.translateX !== undefined) {
      transform.push({
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [fromTranslateX, to.translateX],
        }),
      });
    }

    if (fromScale !== undefined && to.scale !== undefined) {
      transform.push({
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [fromScale, to.scale],
        }),
      });
    }

    const transformOrigin = enterConfig.transformOrigin
      ? resolveBinding(enterConfig.transformOrigin, context)
      : undefined;
    if (transformOrigin) {
      style.transformOrigin = transformOrigin;
    }

    if (transform.length > 0) {
      style.transform = transform;
    }

    return style;
  };

  const getExitAnimatedStyle = () => {
    if (!exitConfig?.to) return {};

    const to = exitConfig.to;
    const transform: any[] = [];
    let style: any = {};

    const toOpacity = resolveBinding(to.opacity, context);
    const toTranslateY = resolveBinding(to.translateY, context);
    const toTranslateX = resolveBinding(to.translateX, context);
    const toScale = resolveBinding(to.scale, context);

    if (toOpacity !== undefined) {
      style.opacity = exitAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, toOpacity],
      });
    }

    if (toTranslateY !== undefined && toTranslateY !== 0) {
      transform.push({
        translateY: exitAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, toTranslateY],
        }),
      });
    }

    if (toTranslateX !== undefined && toTranslateX !== 0) {
      transform.push({
        translateX: exitAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, toTranslateX],
        }),
      });
    }

    if (toScale !== undefined && toScale !== 1) {
      transform.push({
        scale: exitAnimatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, toScale],
        }),
      });
    }

    const transformOrigin = exitConfig.transformOrigin
      ? resolveBinding(exitConfig.transformOrigin, context)
      : undefined;
    if (transformOrigin) {
      style.transformOrigin = transformOrigin;
    }

    if (transform.length > 0) {
      style.transform = transform;
    }

    return style;
  };

  const hasHeightAnimation = layoutConfig?.type === 'height';
  const hasExitAnimation = !!exitConfig;
  const hasEnterAnimation = !!enterConfig;
  const needsAnimated = hasEnterAnimation || hasExitAnimation || hasHeightAnimation;

  const exitStyle = isExitAnimating ? getExitAnimatedStyle() : null;

  if (Component === View && needsAnimated) {
    let baseStyle: any = componentProps.style;
    if (hasHeightAnimation) {
      const useAnimatedValue = shouldAnimateLayout && !isFirstRender.current && currentHeight > 0;
      if (useAnimatedValue) {
        baseStyle = { ...componentProps.style, height: animatedHeight };
      }
    }

    const styleArray: any[] = [baseStyle];
    if (hasEnterAnimation && animationTrigger) {
      styleArray.push(getEnterAnimatedStyle());
    }
    if (exitStyle) {
      styleArray.push(exitStyle);
    }

    return (
      <Animated.View key={componentKey} {...componentProps} style={styleArray}>
        {children}
      </Animated.View>
    );
  }

  if (Component === SafeAreaView && hasExitAnimation) {
    const styleArray: any[] = [componentProps.style];
    if (exitStyle) {
      styleArray.push(exitStyle);
    }

    return (
      <AnimatedSafeAreaView key={componentKey} {...componentProps} style={styleArray}>
        {children}
      </AnimatedSafeAreaView>
    );
  }

  return (
    <Component key={componentKey} {...componentProps}>
      {children}
    </Component>
  );
};

const renderNode = (node: SchemaNode, context: BuilderContext, key: string): React.ReactNode => {
  if (node.slot && context.slots) {
    return context.slots[node.slot] || null;
  }

  if (node.if !== undefined && !evaluateCondition(node.if, context)) {
    return null;
  }

  const Component = componentRegistry.get(node.type);
  if (!Component) {
    console.warn(`Component "${node.type}" not in registry`);
    return null;
  }

  const resolvedProps = node.props ? resolveBinding(node.props, context) : {};

  const hasContentProperty = (node as any).content !== undefined;
  const content = hasContentProperty ? resolveBinding((node as any).content, context) : null;

  const children = node.children?.map((child, index) => 
    renderNode(child, context, `${key}-${index}`)
  );

  if (node.animation) {
    return (
      <AnimatedComponent
        key={key}
        animation={node.animation}
        context={context}
        Component={Component}
        componentProps={resolvedProps}
        componentKey={key}
      >
        {hasContentProperty ? content : children}
      </AnimatedComponent>
    );
  }

  return (
    <Component key={key} {...resolvedProps}>
      {hasContentProperty ? content : children}
    </Component>
  );
};

export const Builder: React.FC<BuilderProps> = ({ schema, context }) => {
  if (!schema) {
    return null;
  }

  if (Array.isArray(schema)) {
    return (
      <>
        {schema.map((node, index) => renderNode(node, context, `root-${index}`))}
      </>
    );
  }

  return <>{renderNode(schema, context, 'root')}</>;
};
