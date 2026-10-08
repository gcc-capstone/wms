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
import {
  filterTasks,
  taskCategories,
  TaskCategory,
} from "../../constants/task-list";
import { useTasks } from "../../hooks/use-tasks";

export default function TaskListScreen() {
  const { tasks } = useTasks();
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Available");
  const [refreshMessage, setRefreshMessage] = useState("");
  const filteredTasks = useMemo(
    () => filterTasks(tasks, category, searchText),
    [tasks, category, searchText],
  );

  return (
    <View style={styles.screen}>
      <View style={sharedStyles.header}>
        <Image
          source={require("../../assets/orbital-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.iconButton}
          onPress={() => router.push("/settings")}
        >
          <SymbolView
            name={{ ios: "gearshape", android: "settings", web: "settings" }}
            tintColor={theme.colors.white}
            size={24}
            fallback={<Text style={styles.settingsFallback}>⚙</Text>}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.page, width >= 900 && styles.pageWide]}>
        <View style={styles.titleRow}>
          <Text style={sharedStyles.heading1}>My Tasks</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh tasks"
            style={styles.iconButton}
            onPress={() =>
              setRefreshMessage(
                `Prototype list refreshed at ${new Date().toLocaleTimeString()}. No server connection is used.`,
              )
            }
          >
            <SymbolView
              name={{ ios: "arrow.clockwise", android: "refresh", web: "refresh" }}
              tintColor={theme.colors.navy}
              size={24}
              fallback={<Text style={styles.refreshFallback}>↻</Text>}
            />
          </Pressable>
        </View>
        {!!refreshMessage && (
          <Text accessibilityLiveRegion="polite" style={styles.helperText}>
            {refreshMessage}
          </Text>
        )}

        <TextInput
          accessibilityLabel="Search tasks"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search tasks"
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
        />

        <View accessibilityRole="tablist" style={styles.categoryRow}>
          {taskCategories.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: option === category }}
              style={[styles.categoryTab, option === category && styles.categoryTabSelected]}
              onPress={() => setCategory(option)}
            >
              <Text style={[styles.categoryText, option === category && styles.categoryTextSelected]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {category === "Current" && (
          <Text style={styles.helperText}>
            These tasks are waiting for a prerequisite task to be completed.
          </Text>
        )}
        <Text style={styles.resultCount}>
          {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </Text>
        <View style={styles.taskList}>
          {filteredTasks.map((task) => (
            <Pressable
              key={task.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${task.title}`}
              style={styles.taskCard}
              onPress={() => router.push(`/tasks/${task.id}`)}
            >
              <View style={styles.taskCardAccent} />
              <View style={styles.taskMain}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.dueDate}>Due {task.dueDate}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={sharedStyles.heading2}>No tasks found</Text>
              <Text style={styles.helperText}>
                Try another search or task tab.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  logo: { width: 38 * (304 / 110), height: 38 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsFallback: { color: theme.colors.white, fontSize: 20 },
  refreshFallback: { color: theme.colors.navy, fontSize: 28 },
  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: theme.spacing.xl,
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  pageWide: { padding: 32, paddingBottom: 48 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  categoryRow: { flexDirection: "row" },
  categoryTab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  categoryTabSelected: { borderBottomColor: theme.colors.navy },
  categoryText: { fontSize: 14, fontWeight: "600", color: theme.colors.textMuted },
  categoryTextSelected: { color: theme.colors.navy },
  helperText: { fontSize: 13, lineHeight: 18, color: theme.colors.textMuted },
  resultCount: { fontSize: 13, color: theme.colors.textMuted },
  taskList: { gap: theme.spacing.sm },
  taskCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.mist,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  taskCardAccent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 3,
    backgroundColor: theme.colors.gold,
    marginRight: theme.spacing.md,
  },
  taskMain: { flex: 1, minWidth: 0 },
  taskTitle: { color: theme.colors.navy, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  dueDate: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: theme.colors.navy, fontSize: 26, marginLeft: theme.spacing.sm },
  emptyState: { ...sharedStyles.card, alignItems: "center", gap: theme.spacing.sm },
});
