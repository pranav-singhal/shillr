import React from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
}

export default function Slider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
}: SliderProps) {
  const { colors } = useTheme();
  const thumbSize = 24;
  const trackHeight = 6;
  const stepValue = step || 1;
  
  const animatedValue = React.useRef(new Animated.Value(
    ((value - minimumValue) / (maximumValue - minimumValue)) * 100
  )).current;

  React.useEffect(() => {
    const newPosition = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    animatedValue.setValue(newPosition);
  }, [value, minimumValue, maximumValue]);

  const getValueFromPercent = (percent: number) => {
    let rawValue = (percent / 100) * (maximumValue - minimumValue) + minimumValue;
    
    if (step) {
      rawValue = Math.round(rawValue / step) * step;
    }
    
    return Math.max(minimumValue, Math.min(maximumValue, rawValue));
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const { width } = containerMeasure.current;
        const percent = Math.max(0, Math.min(100, (gestureState.moveX - containerMeasure.current.x) / width * 100));
        animatedValue.setValue(percent);
        onValueChange(getValueFromPercent(percent));
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const containerMeasure = React.useRef({ x: 0, y: 0, width: 0, height: 0 });

  const thumbLeft = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, '100%'],
    extrapolate: 'clamp',
  });

  const trackWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        containerMeasure.current = { x, y, width, height };
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.border,
            height: trackHeight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: colors.tint,
              height: trackHeight,
              width: trackWidth,
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            width: thumbSize,
            height: thumbSize,
            backgroundColor: colors.tint,
            borderColor: colors.background,
            marginLeft: -thumbSize / 2,
            marginTop: -thumbSize / 2 + trackHeight / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});