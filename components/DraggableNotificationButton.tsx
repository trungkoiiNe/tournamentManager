import React, { useState, useRef } from "react";
import { Animated, PanResponder, Dimensions, StyleSheet } from "react-native";
import NotificationButton from "./NotificationButton";

const { width, height } = Dimensions.get("window");

const DraggableNotificationButton = () => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({ x: width - 80, y: height - 200 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (e, gesture) => {
      let newX = position.x + gesture.dx;
      let newY = position.y + gesture.dy;

      // Ensure the button stays within the screen bounds
      newX = Math.max(0, Math.min(newX, width - 60));
      newY = Math.max(0, Math.min(newY, height - 60));

      setPosition({ x: newX, y: newY });
      pan.flattenOffset();
    },
  });

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <NotificationButton />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
});

export default DraggableNotificationButton;