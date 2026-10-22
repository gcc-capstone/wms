import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { TaskStatusBadge } from "../../components/task-status-badge";
import { TopToast } from "../../components/top-toast";
import { usePullToRefresh } from "../../hooks/use-pull-to-refresh";

export default function TaskListScreen() {
  const { tasks, draftSavedPending, acknowledgeDraftSaved } = useTasks();
  const [toast, setToast] = useState<{ message: string; sequence: number } | null>(null);
  const onRefresh = useCallback(() => {
    setToast((previous) => ({ message: "Task List Refreshed", sequence: (previous?.sequence ?? 0) + 1 }));
  }, []);
  const { offset, dragging, refreshing, refresh, panHandlers, setScrollTop } = usePullToRefresh(onRefresh);
  useFocusEffect(useCallback(() => {
    if (!draftSavedPending) return;
    setToast((previous) => ({ message: "Draft Saved", sequence: (previous?.sequence ?? 0) + 1 }));
    acknowledgeDraftSaved();
  }, [draftSavedPending, acknowledgeDraftSaved]));
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Available");
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

      <View style={styles.listBody} {...panHandlers}>
        <Animated.View pointerEvents="none" style={[styles.pullIndicator, { opacity: offset.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: "clamp" }) }]}>
          {refreshing && <ActivityIndicator color={theme.colors.navy} />}
        </Animated.View>
        <Animated.View style={[styles.listContent, { transform: [{ translateY: offset }] }]}>
          <ScrollView
            style={styles.listContent}
            contentContainerStyle={[styles.page, width >= 900 && styles.pageWide]}
            onScroll={(event) => setScrollTop(event.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            scrollEnabled={!dragging}
            bounces={false}
            overScrollMode="never"
          >
            <View style={styles.titleRow}>
              <Text style={sharedStyles.heading1}>My Tasks</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh tasks"
                style={styles.iconButton}
                accessibilityState={{ disabled: refreshing, busy: refreshing }}
                disabled={refreshing}
                onPress={() => refresh()}
              >
                {refreshing ? <ActivityIndicator color={theme.colors.navy} size="small" /> : <SymbolView
                  name={{ ios: "arrow.clockwise", android: "refresh", web: "refresh" }}
                  tintColor={theme.colors.navy}
                  size={24}
                  fallback={<Text style={styles.refreshFallback}>↻</Text>}
                />}
              </Pressable>
            </View>

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
                  {task.status === "Pending" && <TaskStatusBadge status="Pending" />}
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
        </Animated.View>
      </View>
      {toast && <TopToast key={toast.sequence} message={toast.message} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  listBody: { flex: 1, overflow: "hidden" },
  listContent: { flex: 1, backgroundColor: theme.colors.background },
  pullIndicator: { position: "absolute", top: 16, left: 0, right: 0, alignItems: "center" },
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
