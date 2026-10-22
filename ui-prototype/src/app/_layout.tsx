import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TaskProvider } from "../hooks/use-tasks";
import { theme } from "../theme/orbital-theme";
import { AndroidBackTransitionProvider } from "../components/android-back-transition";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <AndroidBackTransitionProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === "ios" ? "default" : "slide_from_right",
              presentation: "card",
              contentStyle: { backgroundColor: theme.colors.background },
              freezeOnBlur: false,
              gestureEnabled: true,
              gestureDirection: "horizontal",
              fullScreenGestureEnabled: false,
              animationMatchesGesture: false,
              fullScreenGestureShadowEnabled: false,
            }}
          >
            <Stack.Screen name="tasks/index" options={{ animationTypeForReplace: "pop" }} />
            <Stack.Screen name="tasks/[id]" options={{ animationTypeForReplace: "pop" }} />
          </Stack>
        </AndroidBackTransitionProvider>
      </TaskProvider>
    </GestureHandlerRootView>
  );
}
