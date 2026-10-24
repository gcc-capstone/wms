import { Pressable, StyleSheet, Text, View } from "react-native";

import { Task } from "../constants/tasks";
import { useTasks } from "../hooks/use-tasks";
import { sharedStyles, theme } from "../theme/orbital-theme";

export function TaskSyncPanel({ task }: { task: Task }) {
  const { beginSync } = useTasks();
  if (task.scenario !== "uploadFailure" || task.status !== "Error") return null;

  return (
    <View style={[sharedStyles.card, styles.panel]}>
      <Text accessibilityRole="alert" style={[sharedStyles.heading2, styles.error]}>Photo upload failed</Text>
      <Pressable accessibilityRole="button" style={sharedStyles.secondaryButton} onPress={() => beginSync(task.id, true)}>
        <Text style={sharedStyles.secondaryButtonText}>Retry Failed Photograph</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: theme.spacing.md },
  error: { color: theme.colors.errorAccent },
});
