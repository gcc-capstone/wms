import { StyleSheet, Text, View } from "react-native";

import { TaskStatus } from "../constants/tasks";
import { theme } from "../theme/orbital-theme";

const statusColors: Record<TaskStatus, { backgroundColor: string; color: string }> = {
  Current: { backgroundColor: theme.colors.navy, color: theme.colors.white },
  "In Progress": { backgroundColor: theme.colors.navy, color: theme.colors.white },
  Upcoming: { backgroundColor: theme.colors.gold, color: theme.colors.ink },
  "Not Started": { backgroundColor: theme.colors.gold, color: theme.colors.ink },
  Completed: { backgroundColor: theme.colors.mist, color: theme.colors.ink },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const colors = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text, { color: colors.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 88,
    minHeight: 30,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 12, fontWeight: "700" },
});
