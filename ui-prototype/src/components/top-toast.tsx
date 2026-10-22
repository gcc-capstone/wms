import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import { theme } from "../theme/orbital-theme";

export function TopToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  const offset = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    const animation = Animated.timing(offset, { toValue: 0, duration: 300, useNativeDriver: true });
    animation.start();
    const timeout = setTimeout(() => setVisible(false), 4000);
    return () => {
      animation.stop();
      clearTimeout(timeout);
    };
  }, [offset]);

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { transform: [{ translateY: offset }] }]}>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", top: 68, left: 24, right: 24, alignItems: "center", zIndex: 100 },
  message: {
    backgroundColor: theme.colors.navy,
    color: theme.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    maxWidth: 640,
    elevation: 4,
  },
});
