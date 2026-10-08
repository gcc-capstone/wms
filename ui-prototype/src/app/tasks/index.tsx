import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { sharedStyles, theme } from "../../theme/orbital-theme";
import { Priority, Task, TaskStatus } from "../../constants/tasks";
import { TaskDropdown } from "../../components/task-dropdown";
import { TaskStatusBadge } from "../../components/task-status-badge";
import { useTasks } from "../../hooks/use-tasks";

const statusOptions: ("All" | TaskStatus)[] = [
  "All",
  "In Progress",
  "Not Started",
  "Current",
  "Upcoming",
  "Completed",
];

const priorityOptions: ("All" | Priority)[] = [
  "All",
  "High",
  "Normal",
  "Medium",
  "Low",
];

export default function TaskListScreen() {
  const { tasks } = useTasks();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 900;
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
        task.description.toLowerCase().includes(search) ||
        !!task.technician?.toLowerCase().includes(search) ||
        !!task.location?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchText, statusFilter, priorityFilter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/orbital-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
          hitSlop={8}
        >
          <SymbolView
            name={{ ios: "gearshape", android: "settings", web: "settings" }}
            tintColor={theme.colors.white}
            size={24}
            fallback={<Text style={styles.settingsFallback}>⚙</Text>}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.page, wideLayout && styles.pageWide]}>
        <View style={[styles.titleRow, !wideLayout && styles.titleRowNarrow]}>
          <View style={styles.titleArea}>
            <Text style={sharedStyles.heading1}>My Tasks</Text>
            <Text style={styles.subtitle}>
              Search and review your assigned field work.
            </Text>
          </View>

          <Pressable style={styles.refreshButton} onPress={() => {}}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>

        <View style={[styles.filterPanel, wideLayout && styles.filterPanelWide]}>
          <View style={[styles.searchArea, wideLayout && styles.searchAreaWide]}>
            <Text style={sharedStyles.label}>Search Tasks</Text>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search tasks, technicians, or sites"
              placeholderTextColor={theme.colors.textMuted}
              style={sharedStyles.input}
            />
          </View>

          <View style={[styles.filterArea, wideLayout && styles.filterAreaWide]}>
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

          <View style={[styles.priorityArea, wideLayout && styles.priorityAreaWide]}>
            <Text style={sharedStyles.label}>Priority</Text>
            <TaskDropdown
              label="Priority"
              value={priorityFilter}
              options={priorityOptions}
              onChange={setPriorityFilter}
            />
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
              onPress={() => router.push(`/tasks/${task.id}`)}
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
  const { width } = useWindowDimensions();
  return (
    <Pressable style={styles.taskCard} onPress={onPress}>
      <View style={styles.taskCardAccent} />

      <View style={styles.taskMain}>
        <View style={[styles.taskTopRow, width < 600 && styles.taskTopRowNarrow]}>
          <View style={styles.taskTitleArea}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.dueDate}>Due {task.dueDate}</Text>
            {task.technician && <Text style={styles.dueDate}>{task.technician} · {task.location}</Text>}
          </View>

          <TaskStatusBadge status={task.status} />
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
                ? "Saved on device · Waiting to sync"
                : task.syncStatus === "Up to date" && task.status === "Completed" && task.scenario
                  ? "Synchronized with WMS"
                  : task.syncStatus
            }
            tone={task.syncStatus === "Unsynced" ? "gold" : "neutral"}
          />
          {task.scenario === "offline" && task.status !== "Completed" && (
            <InfoBadge label="Checklist and photos ready for offline use" tone="neutral" />
          )}
          {task.safety && <InfoBadge label={`Safety Checklist: ${task.safety.status}`} tone="neutral" />}
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
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
    width: 54 * (304 / 110),
    height: 54,
  },

  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsFallback: {
    color: theme.colors.white,
    fontSize: 20,
  },

  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  pageWide: {
    padding: 32,
    paddingBottom: 48,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  titleRowNarrow: {
    flexDirection: "column",
    gap: theme.spacing.lg,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.xl,
    flexWrap: "wrap",
    marginBottom: theme.spacing.xxl,
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
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.xl,
  },
  filterPanelWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  searchAreaWide: { flex: 1.2 },
  filterAreaWide: { flex: 1.4 },
  priorityAreaWide: { flex: 0.7 },

  searchArea: {
    gap: theme.spacing.xs,
  },

  filterArea: {
    gap: theme.spacing.xs,
  },

  priorityArea: {
    gap: theme.spacing.xs,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },

  filterChip: {
    minHeight: 46,
    flexGrow: 1,
    paddingHorizontal: theme.spacing.sm,
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
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.navy,
  },

  filterChipTextSelected: {
    color: theme.colors.white,
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
    gap: theme.spacing.xl,
  },

  taskCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
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
    flexWrap: "wrap",
  },
  taskTopRowNarrow: {
    flexDirection: "column",
    gap: theme.spacing.sm,
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
