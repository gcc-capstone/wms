import { StyleSheet, Text, View } from "react-native";

import { TaskDisplayStatus } from "../constants/task-list";
import { theme } from "../theme/orbital-theme";

export const statusColors: Record<TaskDisplayStatus, { backgroundColor: string; color: string; accent: string }> = {
  Current: { backgroundColor: theme.colors.current, color: theme.colors.ink, accent: theme.colors.currentAccent },
  Available: { backgroundColor: theme.colors.available, color: theme.colors.ink, accent: theme.colors.availableAccent },
  Completed: { backgroundColor: theme.colors.completed, color: theme.colors.ink, accent: theme.colors.completedAccent },
  Error: { backgroundColor: theme.colors.error, color: theme.colors.errorAccent, accent: theme.colors.errorAccent },
  Pending: { backgroundColor: theme.colors.pending, color: theme.colors.ink, accent: theme.colors.pendingAccent },
};

export function TaskStatusBadge({ status, header = false, label = status }: { status: TaskDisplayStatus; header?: boolean; label?: string }) {
  const colors = statusColors[status];
  return (
    <View style={[styles.badge, header && styles.headerBadge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text, header && styles.headerText, { color: colors.color }]}>{label}</Text>
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
  headerBadge: { minHeight: 40, borderRadius: theme.radius.sm },
  headerText: { fontSize: 14 },
});
