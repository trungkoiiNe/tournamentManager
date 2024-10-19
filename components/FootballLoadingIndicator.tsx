import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
} from "react-native";
import { Audio } from "expo-av";
const FootballLoadingIndicator = ({
  size = "big",
  color = "#ffffff",
  backgroundColor = "rgba(0, 100, 0, 0.8)",
}: {
  size?: "small" | "big";
  color?: string;
  backgroundColor?: string;
}) => {
  const [ballPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [textOpacity] = useState(new Animated.Value(1));
  const [loadingMessage, setLoadingMessage] = useState("Kicking off...");
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const messages = [
    "Kicking off...",
    "Setting up the play...",
    "Passing the ball...",
    "Dribbling downfield...",
    "Lining up the shot...",
  ];

  useEffect(() => {
    startAnimations();
    // playWhistleSound();
    setupAccessibility();

    const messageInterval = setInterval(() => {
      setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    // Clean up function
    return () => {
      clearInterval(messageInterval);
      // if (sound) {
      //   sound.stopAsync().then(() => {
      //     sound.unloadAsync();
      //   });
      // }
    };
  }, []);

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ballPosition, {
          toValue: { x: 100, y: -50 },
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ballPosition, {
          toValue: { x: -100, y: 50 },
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  // const playWhistleSound = async () => {
  //   try {
  //     const { sound } = await Audio.Sound.createAsync(
  //       require("../assets/start.mp3")
  //     );
  //     setSound(sound);
  //     await sound.playAsync();
  //   } catch (error) {
  //     console.log("Error playing sound", error);
  //   }
  // };
  const setupAccessibility = () => {
    AccessibilityInfo.announceForAccessibility("Loading. Please wait.");
  };
  // const stopSound = async () => {
  //   if (sound) {
  //     await sound.stopAsync();
  //     await sound.unloadAsync();
  //     setSound(null);
  //   }
  // };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image
        source={require("../assets/football-field.jpg")}
        style={styles.fieldBackground}
      />
      <Animated.View
        style={[
          styles.ballContainer,
          {
            transform: [
              { translateX: ballPosition.x },
              { translateY: ballPosition.y },
            ],
          },
        ]}
      >
        <Image
          source={require("../assets/football-icon.png")}
          style={[
            styles.football,
            {
              width: size === "small" ? 30 : 80,
              height: size === "small" ? 30 : 80,
            },
          ]}
        />
      </Animated.View>
      <Animated.Text
        style={[styles.loadingText, { color, opacity: textOpacity }]}
        accessibilityLabel={loadingMessage}
      >
        {loadingMessage}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  ballContainer: {
    marginBottom: 20,
  },
  football: {
    resizeMode: "contain",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default FootballLoadingIndicator;
