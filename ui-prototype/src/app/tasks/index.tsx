import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  PanResponder,
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
  taskDisplayStatus,
  taskStatusFilters,
  TaskStatusFilter,
} from "../../constants/task-list";
import { useTasks } from "../../hooks/use-tasks";
import { statusColors, TaskStatusBadge } from "../../components/task-status-badge";
import { TopToast } from "../../components/top-toast";
import { usePullToRefresh } from "../../hooks/use-pull-to-refresh";

export default function TaskListScreen() {
  const { tasks, draftSavedPending, acknowledgeDraftSaved } = useTasks();
  const [toast, setToast] = useState<{ message: string; sequence: number } | null>(null);
  const onRefresh = useCallback(() => {
    setToast((previous) => ({ message: "Task List Refreshed", sequence: (previous?.sequence ?? 0) + 1 }));
  }, []);
  const { offset, dragging, refreshing, panHandlers, setScrollTop } = usePullToRefresh(onRefresh);
  useFocusEffect(useCallback(() => {
    if (!draftSavedPending) return;
    setToast((previous) => ({ message: "Draft Saved", sequence: (previous?.sequence ?? 0) + 1 }));
    acknowledgeDraftSaved();
  }, [draftSavedPending, acknowledgeDraftSaved]));
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<View>(null);
  const [filterAnchor, setFilterAnchor] = useState({ right: 20, top: 0 });
  const [statusFilters, setStatusFilters] = useState<TaskStatusFilter[]>([]);
  const [category, setCategory] = useState<TaskCategory>("My Tasks");
  const categorySwipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 60 || Math.abs(gesture.dx) <= Math.abs(gesture.dy) * 1.5) return;
      setCategory((previous) => {
        const nextIndex = taskCategories.indexOf(previous) + (gesture.dx < 0 ? 1 : -1);
        return taskCategories[Math.max(0, Math.min(taskCategories.length - 1, nextIndex))];
      });
    },
  }), []);
  const filteredTasks = useMemo(
    () => filterTasks(tasks, category, searchText, statusFilters),
    [tasks, category, searchText, statusFilters],
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

            <View style={styles.searchSection}>
              <View style={styles.searchRow}>
              <TextInput
                accessibilityLabel="Search tasks"
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search tasks"
                placeholderTextColor={theme.colors.textMuted}
                style={[sharedStyles.input, styles.searchInput]}
              />
                <Pressable
                  ref={filterButtonRef}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter task status${statusFilters.length ? `: ${statusFilters.join(", ")}` : ": All statuses"}`}
                  accessibilityState={{ expanded: filterOpen && category === "My Tasks", disabled: category === "Completed" }}
                  disabled={category === "Completed"}
                  style={[styles.filterButton, statusFilters.length > 0 && category === "My Tasks" && styles.filterButtonActive, category === "Completed" && styles.filterButtonDisabled]}
                  onPress={() => {
                    filterButtonRef.current?.measureInWindow((x, y, buttonWidth, buttonHeight) => {
                      setFilterAnchor({ right: Math.max(12, width - x - buttonWidth), top: y + buttonHeight + theme.spacing.sm });
                      setFilterOpen(true);
                    });
                  }}
                >
                  <SymbolView
                    name={{ ios: "line.3.horizontal.decrease", android: "filter_list", web: "filter_list" }}
                    tintColor={theme.colors.navy}
                    size={24}
                    fallback={<Text style={styles.filterIconFallback}>☷</Text>}
                  />
                </Pressable>

              </View>

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
            </View>

            <View style={styles.categoryContent} {...categorySwipe.panHandlers}>
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
                    <View style={[styles.taskCardAccent, { backgroundColor: statusColors[taskDisplayStatus(task)].accent }]} />
                    <View style={styles.taskMain}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.dueDate}>Due {task.dueDate}</Text>
                    </View>
                    <TaskStatusBadge status={taskDisplayStatus(task)} />
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
            </View>
          </ScrollView>
        </Animated.View>
      </View>
      <Modal transparent visible={filterOpen && category === "My Tasks"} onRequestClose={() => setFilterOpen(false)} animationType="none" statusBarTranslucent>
        <View style={styles.filterOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close task filters" style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} />
          <View style={[styles.filterPanel, { top: filterAnchor.top, right: filterAnchor.right, maxWidth: width - 24 }]}>
            <Text style={styles.filterHeading}>Task status</Text>
            {taskStatusFilters.map((status) => (
              <Pressable
                key={status}
                accessibilityRole="checkbox"
                accessibilityLabel={status}
                accessibilityState={{ checked: statusFilters.includes(status) }}
                style={styles.filterOption}
                onPress={() => setStatusFilters((previous) => previous.includes(status)
                  ? previous.filter((entry) => entry !== status)
                  : [...previous, status])}
              >
                <Text style={styles.filterText}>{statusFilters.includes(status) ? "☑" : "☐"} {status}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
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
  page: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  pageWide: { padding: 32, paddingTop: theme.spacing.lg, paddingBottom: 48 },

  searchSection: { gap: theme.spacing.sm, zIndex: 10 },
  searchRow: { flexDirection: "row", gap: theme.spacing.sm, alignItems: "center", zIndex: 1 },
  searchInput: { flex: 1, minWidth: 0 },
  filterButton: { width: 46, height: 46, borderRadius: theme.radius.md, justifyContent: "center", alignItems: "center" },
  filterIconFallback: { color: theme.colors.navy, fontSize: 24 },
  filterButtonActive: { backgroundColor: theme.colors.current, borderColor: theme.colors.navy },
  filterButtonDisabled: { opacity: 0.5 },
  filterHeading: { color: theme.colors.ink, fontSize: 18, fontWeight: "700", marginBottom: theme.spacing.sm },
  filterText: { color: theme.colors.navy, fontSize: 18, fontWeight: "600" },
  filterOverlay: { flex: 1 },
  filterPanel: { position: "absolute", width: 300, zIndex: 20, elevation: 8, padding: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.white },
  filterOption: { minHeight: 56, justifyContent: "center" },
  categoryContent: { flexGrow: 1, gap: theme.spacing.md },
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
    marginRight: theme.spacing.md,
  },
  taskMain: { flex: 1, minWidth: 0 },
  taskTitle: { color: theme.colors.navy, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  dueDate: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: theme.colors.navy, fontSize: 26, marginLeft: theme.spacing.sm },
  emptyState: { ...sharedStyles.card, alignItems: "center", gap: theme.spacing.sm },
});
