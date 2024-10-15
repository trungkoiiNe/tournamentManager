import React, { useEffect } from 'react';
import { Animated, Image, Easing } from 'react-native';

const CustomActivityIndicator = ({ source }: { source: any }) => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Image source={source} style={{ width: 30, height: 30 }} />
    </Animated.View>
  );
};

export default CustomActivityIndicator;
