import { Stack } from "expo-router";
import { TaskProvider } from "../hooks/use-tasks";

export default function RootLayout() {
  return (
    <TaskProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </TaskProvider>
  );
}
