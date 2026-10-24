import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureDetector, GestureType } from "react-native-gesture-handler";

import { sharedStyles, theme } from "../../theme/orbital-theme";
import {
  filterTasks,
  taskCategories,
  TaskCategory,
  taskDisplayStatus,
  taskStatusFilters,
  TaskStatusFilter,
} from "../../constants/task-list";
import { ListSort } from "../../constants/list-sort";
import { SearchSortOptions, SearchStatusTags } from "../../components/search-controls";
import { Task } from "../../constants/tasks";
import { useTasks } from "../../hooks/use-tasks";
import { statusColors, TaskStatusBadge } from "../../components/task-status-badge";
import { FloatingTaskNav } from "../../components/floating-task-nav";
import { TopToast } from "../../components/top-toast";
import { usePullToRefresh } from "../../hooks/use-pull-to-refresh";
import { TaskCategoryPager } from "../../components/task-category-pager";

function NativeGestureBoundary({ gesture, children }: { gesture: GestureType; children: React.ReactElement }) {
  return Platform.OS === "web" ? children : <GestureDetector gesture={gesture}>{children}</GestureDetector>;
}

export default function TaskListScreen() {
  const { tasks, draftSavedPending, acknowledgeDraftSaved } = useTasks();
  const [toast, setToast] = useState<{ message: string; sequence: number } | null>(null);
  const onRefresh = useCallback(() => {
    setToast((previous) => ({ message: "Task List Refreshed", sequence: (previous?.sequence ?? 0) + 1 }));
  }, []);
  const { offset, dragging, refreshing, panHandlers, setScrollTop, nativePullGesture, nativeScrollGesture } = usePullToRefresh(onRefresh);
  useFocusEffect(useCallback(() => {
    if (!draftSavedPending) return;
    setToast((previous) => ({ message: "Draft Saved", sequence: (previous?.sequence ?? 0) + 1 }));
    acknowledgeDraftSaved();
  }, [draftSavedPending, acknowledgeDraftSaved]));
  const { width, height } = useWindowDimensions();
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<View>(null);
  const [filterAnchor, setFilterAnchor] = useState({ right: 20, top: 0 });
  const [sort, setSort] = useState<ListSort>("oldest");
  const [statusFilters, setStatusFilters] = useState<TaskStatusFilter[]>([]);
  const [category, setCategory] = useState<TaskCategory>("My Tasks");
  const [swipingCategory, setSwipingCategory] = useState(false);
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setStatusFilters([]);
    setSort("oldest");
    setFilterOpen(false);
    setSwipingCategory(false);
    Keyboard.dismiss();
  };
  useFocusEffect(useCallback(() => {
    setSearchOpen(false);
    setSearchText("");
    setStatusFilters([]);
    setSort("oldest");
    setFilterOpen(false);
    Keyboard.dismiss();
  }, []));
  const taskPages = useMemo(() => ({
    "My Tasks": filterTasks(tasks, "My Tasks", searchText, statusFilters),
    Completed: filterTasks(tasks, "Completed", searchText, statusFilters),
  }), [tasks, searchText, statusFilters]);

  const allSearchTasks = useMemo(() => filterTasks(tasks, "All", searchText, statusFilters, sort), [tasks, searchText, statusFilters, sort]);
  const renderTasks = (filteredTasks: Task[]) => (
    <>
      <View style={styles.taskList}>
        {filteredTasks.map((task) => (
          <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={`Open ${task.title}`} style={styles.taskCard} onPress={() => router.push(`/tasks/${task.id}`)}>
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
            <Text style={styles.helperText}>{searchOpen ? "Try another search." : "Try another search or task tab."}</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      <View style={sharedStyles.header}>
        <Image
          source={require("../../assets/orbital-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? "Close task search" : "Search tasks"}
            accessibilityState={{ expanded: searchOpen }}
            style={styles.iconButton}
            onPress={() => {
              setSwipingCategory(false);
              setSearchOpen(!searchOpen);
              setFilterOpen(false);
              if (searchOpen) {
                closeSearch();
              } else {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }
            }}
          >
            <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }} tintColor={theme.colors.white} size={24} fallback={<Text style={styles.settingsFallback}>⌕</Text>} />
          </Pressable>
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
      </View>

      <NativeGestureBoundary gesture={nativePullGesture}>
        <View style={styles.listBody} {...(Platform.OS === "web" ? panHandlers : {})}>
          <Animated.View pointerEvents="none" style={[styles.pullIndicator, { opacity: offset.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: "clamp" }) }]}>
            {refreshing && <ActivityIndicator color={theme.colors.navy} />}
          </Animated.View>
          <Animated.View style={[styles.listContent, { transform: [{ translateY: offset }] }]}>
            <NativeGestureBoundary gesture={nativeScrollGesture}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                ref={scrollRef}
                style={styles.listContent}
                contentContainerStyle={[styles.page, width >= 900 && styles.pageWide]}
                onScroll={(event) => setScrollTop(event.nativeEvent.contentOffset.y)}
                scrollEventThrottle={16}
                scrollEnabled={!dragging && !swipingCategory}
                bounces={false}
                overScrollMode="never"
              >

                <View style={styles.searchSection}>
                  {searchOpen ? (
                  <View style={styles.searchRow}>
                  <TextInput
                    autoFocus
                    accessibilityLabel="Search tasks"
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search tasks"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[sharedStyles.input, styles.searchInput]}
                  />
                    <Pressable accessibilityRole="button" accessibilityLabel="Close task search" style={styles.searchClose} onPress={closeSearch}><Text style={styles.searchCloseText}>×</Text></Pressable>
                  </View>
                  ) : <View style={styles.tasksHeading}><Text accessibilityRole="header" style={sharedStyles.heading1}>Tasks</Text></View>}

                  {searchOpen && (
                    <View style={styles.searchTools}>
                      <SearchStatusTags statuses={taskStatusFilters} selected={statusFilters} onToggle={(status) => setStatusFilters((previous) => previous.includes(status) ? previous.filter((entry) => entry !== status) : [...previous, status])} />
                      <Pressable
                        ref={filterButtonRef}
                        hitSlop={4}
                        accessibilityRole="button"
                        accessibilityLabel="Sort tasks"
                        accessibilityState={{ expanded: filterOpen }}
                        style={[styles.filterButton, sort !== "oldest" && styles.filterButtonActive]}
                        onPress={() => {
                          Keyboard.dismiss();
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
                  )}
                  {!searchOpen && <View accessibilityRole="tablist" style={styles.categoryRow}>
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
                  </View>}
                </View>

                {searchOpen ? renderTasks(allSearchTasks) : (
                  <TaskCategoryPager category={category} onCategoryChange={setCategory} onSwipeStateChange={setSwipingCategory} minHeight={Math.max(240, height - 250)}>
                    {(page) => renderTasks(taskPages[page])}
                  </TaskCategoryPager>
                )}
              </ScrollView>
            </NativeGestureBoundary>
          </Animated.View>
        </View>
      </NativeGestureBoundary>
      {!searchOpen && <FloatingTaskNav selected="Tasks" />}
      <Modal transparent visible={filterOpen && searchOpen} onRequestClose={() => setFilterOpen(false)} animationType="none" statusBarTranslucent>
        <View style={styles.filterOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close task sorting" style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} />
          <View style={[styles.filterPanel, { top: filterAnchor.top, right: filterAnchor.right, maxWidth: width - 24 }]}>
            <SearchSortOptions selected={sort} onSelect={(value) => { setSort(value); setFilterOpen(false); }} />
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  tasksHeading: { minHeight: 46, justifyContent: "center" },
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
  searchInput: { flex: 1, minWidth: 0, paddingRight: 48 },
  searchClose: { position: "absolute", right: 0, top: 0, width: 44, height: 46, alignItems: "center", justifyContent: "center" },
  searchCloseText: { color: theme.colors.navy, fontSize: 26, lineHeight: 30 },
  searchTools: { flexDirection: "row", gap: 6, alignItems: "center" },
  filterButton: { width: 36, height: 36, borderRadius: theme.radius.md, justifyContent: "center", alignItems: "center" },
  filterIconFallback: { color: theme.colors.navy, fontSize: 24 },
  filterButtonActive: { backgroundColor: theme.colors.current, borderColor: theme.colors.navy },
  filterOverlay: { flex: 1 },
  filterPanel: { position: "absolute", width: 300, zIndex: 20, elevation: 8, padding: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.white },
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
