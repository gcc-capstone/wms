import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { sharedStyles, theme } from "../theme/orbital-theme";

type TaskStatus = "Current" | "Upcoming" | "Completed";
type Priority = "High" | "Medium" | "Low";
type SyncStatus = "Unsynced" | "Up to date";

type Task = {
  id: number;
  title: string;
  dueDate: string;
  status: TaskStatus;
  description: string;
  priority: Priority;
  availableOffline: boolean;
  syncStatus: SyncStatus;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Inspect Pole Line Segment",
    dueDate: "Oct 3, 2026",
    status: "Current",
    description:
      "Complete the field inspection and record visible damage, access issues, and site notes.",
    priority: "High",
    availableOffline: true,
    syncStatus: "Unsynced",
  },
  {
    id: 2,
    title: "Verify Site Measurements",
    dueDate: "Oct 5, 2026",
    status: "Current",
    description:
      "Confirm measurements from the previous survey and attach updated field photos.",
    priority: "Medium",
    availableOffline: true,
    syncStatus: "Up to date",
  },
  {
    id: 3,
    title: "Transformer Location Review",
    dueDate: "Oct 12, 2026",
    status: "Upcoming",
    description:
      "Review the assigned transformer locations and note any access or clearance concerns.",
    priority: "Medium",
    availableOffline: false,
    syncStatus: "Up to date",
  },
  {
    id: 4,
    title: "Right-of-Way Photo Survey",
    dueDate: "Oct 18, 2026",
    status: "Upcoming",
    description:
      "Capture required right-of-way photos and document any obstructions.",
    priority: "Low",
    availableOffline: true,
    syncStatus: "Up to date",
  },
  {
    id: 5,
    title: "Completed Site Walkdown",
    dueDate: "Sep 28, 2026",
    status: "Completed",
    description:
      "Field walkdown completed and submitted with all required notes and attachments.",
    priority: "High",
    availableOffline: true,
    syncStatus: "Up to date",
  },
];

const statusOptions: Array<"All" | TaskStatus> = [
  "All",
  "Current",
  "Upcoming",
  "Completed",
];

const priorityOptions: Array<"All" | Priority> = [
  "All",
  "High",
  "Medium",
  "Low",
];

export default function TaskListScreen() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("All");
  const [priorityFilter, setPriorityFilter] =
    useState<(typeof priorityOptions)[number]>("All");

  const filteredTasks = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        search.length === 0 ||
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchText, statusFilter, priorityFilter]);

  const cyclePriority = () => {
    const currentIndex = priorityOptions.indexOf(priorityFilter);
    const nextIndex = (currentIndex + 1) % priorityOptions.length;
    setPriorityFilter(priorityOptions[nextIndex]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image
          source={require("../assets/orbital-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Pressable
          style={styles.profileButton}
          onPress={() => Alert.alert("Profile", "Profile screen will go here.")}
        >
          <Text style={styles.profileLetter}>P</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.titleRow}>
          <View>
            <Text style={sharedStyles.heading1}>My Tasks</Text>
            <Text style={styles.subtitle}>
              Search and review current, upcoming, and completed assignments.
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={() => {}}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>

        <View style={styles.filterPanel}>
          <View style={styles.searchArea}>
            <Text style={sharedStyles.label}>Search Tasks</Text>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by title or description"
              placeholderTextColor={theme.colors.textMuted}
              style={sharedStyles.input}
            />
          </View>

          <View style={styles.filterArea}>
            <Text style={sharedStyles.label}>Status</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((option) => {
                const selected = option === statusFilter;

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                    ]}
                    onPress={() => setStatusFilter(option)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.priorityArea}>
            <Text style={sharedStyles.label}>Priority</Text>
            <Pressable style={styles.dropdownButton} onPress={cyclePriority}>
              <Text style={styles.dropdownButtonText}>
                {priorityFilter === "All"
                  ? "All Priorities"
                  : priorityFilter}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={sharedStyles.heading2}>Tasks</Text>
          <Text style={styles.resultCount}>
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </Text>
        </View>

        <View style={styles.taskList}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() =>
                Alert.alert(
                  task.title,
                  "Task details screen will be added in the next prototype step."
                )
              }
            />
          ))}

          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No tasks found</Text>
              <Text style={styles.emptyStateText}>
                Try changing the search text or filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TaskCard({
  task,
  onPress,
}: {
  task: Task;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.taskCard} onPress={onPress}>
      <View style={styles.taskCardAccent} />

      <View style={styles.taskMain}>
        <View style={styles.taskTopRow}>
          <View style={styles.taskTitleArea}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.dueDate}>Due {task.dueDate}</Text>
          </View>

          <StatusChip status={task.status} />
        </View>

        <Text style={styles.description}>{task.description}</Text>

        <View style={styles.metaRow}>
          <InfoBadge
            label={`Priority: ${task.priority}`}
            tone={task.priority === "High" ? "gold" : "neutral"}
          />

          <InfoBadge
            label={task.availableOffline ? "Available offline" : "Online only"}
            tone="neutral"
          />

          <InfoBadge
            label={
              task.syncStatus === "Unsynced"
                ? "Offline • Unsynced"
                : "Up to date"
            }
            tone={task.syncStatus === "Unsynced" ? "gold" : "neutral"}
          />
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function StatusChip({ status }: { status: TaskStatus }) {
  return (
    <View
      style={[
        styles.statusChip,
        status === "Current" && styles.statusCurrent,
        status === "Upcoming" && styles.statusUpcoming,
        status === "Completed" && styles.statusCompleted,
      ]}
    >
      <Text
        style={[
          styles.statusChipText,
          status === "Completed" && styles.statusCompletedText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

function InfoBadge({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "neutral";
}) {
  return (
    <View
      style={[
        styles.infoBadge,
        tone === "gold" && styles.infoBadgeGold,
      ]}
    >
      <Text
        style={[
          styles.infoBadgeText,
          tone === "gold" && styles.infoBadgeGoldText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navy,
  },

  logo: {
    width: 245,
    height: 54,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  profileLetter: {
    color: theme.colors.navy,
    fontSize: 18,
    fontWeight: "700",
  },

  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },

  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },

  refreshButton: {
    minHeight: 44,
    minWidth: 110,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },

  refreshButtonText: {
    ...theme.typography.button,
    color: theme.colors.navy,
  },

  filterPanel: {
    ...sharedStyles.card,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },

  searchArea: {
    flex: 1.5,
    gap: theme.spacing.sm,
  },

  filterArea: {
    flex: 2,
    gap: theme.spacing.sm,
  },

  priorityArea: {
    width: 180,
    gap: theme.spacing.sm,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },

  filterChip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipSelected: {
    borderColor: theme.colors.navy,
    backgroundColor: theme.colors.navy,
  },

  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.navy,
  },

  filterChipTextSelected: {
    color: theme.colors.white,
  },

  dropdownButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownButtonText: {
    fontSize: 15,
    color: theme.colors.ink,
  },

  dropdownArrow: {
    color: theme.colors.navy,
    fontSize: 18,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },

  resultCount: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },

  taskList: {
    gap: theme.spacing.md,
  },

  taskCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "stretch",

    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  taskCardAccent: {
    width: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.gold,
    marginRight: theme.spacing.lg,
  },

  taskMain: {
    flex: 1,
  },

  taskTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
  },

  taskTitleArea: {
    flex: 1,
  },

  taskTitle: {
    color: theme.colors.navy,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700",
  },

  dueDate: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },

  description: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },

  statusChip: {
    minWidth: 88,
    minHeight: 30,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statusCurrent: {
    backgroundColor: theme.colors.navy,
  },

  statusUpcoming: {
    backgroundColor: theme.colors.gold,
  },

  statusCompleted: {
    backgroundColor: theme.colors.mist,
  },

  statusChipText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  statusCompletedText: {
    color: theme.colors.ink,
  },

  infoBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.warmWhite,
    borderWidth: 1,
    borderColor: theme.colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBadgeGold: {
    borderColor: theme.colors.gold,
    backgroundColor: "#F3EBDD",
  },

  infoBadgeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  infoBadgeGoldText: {
    color: theme.colors.navy,
  },

  chevron: {
    color: theme.colors.navy,
    fontSize: 30,
    lineHeight: 34,
    alignSelf: "center",
    marginLeft: theme.spacing.md,
  },

  emptyState: {
    ...sharedStyles.card,
    alignItems: "center",
    paddingVertical: 36,
  },

  emptyStateTitle: {
    color: theme.colors.navy,
    fontSize: 18,
    fontWeight: "700",
  },

  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
