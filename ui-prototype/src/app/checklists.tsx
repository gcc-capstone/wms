import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Image, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { checklistTypeIcons, filterSafetyForms, SafetyForm, ChecklistSection } from "../constants/safety-forms";
import { ListSort } from "../constants/list-sort";
import { SearchSortOptions, SearchStatusTags } from "../components/search-controls";
import { useSafetyForms } from "../hooks/use-safety-forms";
import { TopToast } from "../components/top-toast";
import { CategoryPager } from "../components/task-category-pager";
import { FloatingTaskNav } from "../components/floating-task-nav";
import { sharedStyles, theme } from "../theme/orbital-theme";

const categories = ["Submitted", "Pending", "Drafts"] as const;

export default function SafetyChecklistsScreen() {
  const { forms, notice, acknowledgeNotice } = useSafetyForms();
  const [toast, setToast] = useState<{ sequence: number; message: string } | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const cardWidth = Math.max(0, Math.floor((gridWidth - theme.spacing.sm) / 2));
  const [swiping, setSwiping] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]>("Submitted");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilters, setStatusFilters] = useState<ChecklistSection[]>([]);
  const [sort, setSort] = useState<ListSort>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState({ right: 20, top: 0 });
  const filterButtonRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setStatusFilters([]);
    setSort("newest");
    setFilterOpen(false);
    setSwiping(false);
    Keyboard.dismiss();
  };
  useFocusEffect(useCallback(() => {
    setSearchOpen(false);
    setSearchText("");
    setStatusFilters([]);
    setSort("newest");
    setFilterOpen(false);
    Keyboard.dismiss();
  }, []));

  useFocusEffect(useCallback(() => {
    if (!notice) return;
    setCategory(notice.section);
    if (notice.message) setToast({ sequence: notice.sequence, message: notice.message });
    acknowledgeNotice();
  }, [notice, acknowledgeNotice]));

  const renderForms = (entries: SafetyForm[]) => (
    <View style={styles.formList} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
      {entries.map((form) => (
        <Pressable key={form.id} accessibilityRole="button" accessibilityLabel={`Open ${form.title.trim() || "Draft Checklist"}`} style={[styles.formCard, { width: cardWidth }]} onPress={() => router.push({ pathname: "/checklists/form/[id]", params: { id: form.id } })}>
          <View style={styles.formTitleRow}>
            <SymbolView name={checklistTypeIcons[form.type]} tintColor={theme.colors.navy} size={28} fallback={<Text style={styles.typeFallback}>▤</Text>} />
            <Text style={styles.formTitle} numberOfLines={2} ellipsizeMode="tail">{form.title.trim() || "Draft Checklist"}</Text>
          </View>
          <Text style={styles.formType}>{form.type} Safety Checklist</Text>
          <View style={[styles.formBadge, { backgroundColor: form.status === "Pending" ? theme.colors.pending : theme.colors.mist }]}><Text style={styles.formBadgeText}>{form.status}</Text></View>
        </Pressable>
      ))}
      {searchOpen && !entries.length && <Text style={sharedStyles.mutedText}>No checklists found</Text>}
    </View>
  );

  return (
    <View style={sharedStyles.screen}>
      <View style={sharedStyles.header}>
        <Image source={require("../assets/orbital-logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? "Close checklist search" : "Search safety checklists"}
            accessibilityState={{ expanded: searchOpen }}
            style={styles.iconButton}
            onPress={() => {
              setSwiping(false);
              setSearchOpen(!searchOpen);
              setFilterOpen(false);
              if (searchOpen) closeSearch();
              else scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }} tintColor={theme.colors.white} size={24} fallback={<Text style={styles.headerFallback}>⌕</Text>} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" style={styles.iconButton} onPress={() => router.push({ pathname: "/settings", params: { returnTo: "checklists" } })}>
            <SymbolView name={{ ios: "gearshape", android: "settings", web: "settings" }} tintColor={theme.colors.white} size={24} fallback={<Text style={styles.headerFallback}>⚙</Text>} />
          </Pressable>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" scrollEnabled={!swiping} ref={scrollRef} contentContainerStyle={[styles.page, width >= 900 && styles.pageWide]}>
        <View style={styles.searchSection}>
          {searchOpen ? (
            <View style={styles.searchRow}>
              <TextInput autoFocus accessibilityLabel="Search safety checklists" value={searchText} onChangeText={setSearchText} placeholder="Search checklists" placeholderTextColor={theme.colors.textMuted} style={[sharedStyles.input, styles.searchInput]} />
              <Pressable accessibilityRole="button" accessibilityLabel="Close checklist search" style={styles.searchClose} onPress={closeSearch}><Text style={styles.searchCloseText}>×</Text></Pressable>
            </View>
          ) : <View style={styles.heading}><Text accessibilityRole="header" style={sharedStyles.heading1}>Safety Checklists</Text></View>}
          {searchOpen && (
            <View style={styles.searchTools}>
              <SearchStatusTags statuses={categories} selected={statusFilters} onToggle={(status) => setStatusFilters((previous) => previous.includes(status) ? previous.filter((entry) => entry !== status) : [...previous, status])} />
              <Pressable
                ref={filterButtonRef}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel="Sort safety checklists"
                accessibilityState={{ expanded: filterOpen }}
                style={styles.filterButton}
                onPress={() => {
                  Keyboard.dismiss();
                  filterButtonRef.current?.measureInWindow((x, y, buttonWidth, buttonHeight) => {
                    setFilterAnchor({ right: Math.max(12, width - x - buttonWidth), top: y + buttonHeight + theme.spacing.sm });
                    setFilterOpen(true);
                  });
                }}
              >
                <SymbolView name={{ ios: "line.3.horizontal.decrease", android: "filter_list", web: "filter_list" }} tintColor={theme.colors.navy} size={24} fallback={<Text style={styles.filterFallback}>☷</Text>} />
              </Pressable>
            </View>
          )}
          {!searchOpen && <View accessibilityRole="tablist" style={styles.categoryRow}>
            {categories.map((option) => (
              <Pressable key={option} accessibilityRole="tab" accessibilityState={{ selected: option === category }} style={[styles.categoryTab, option === category && styles.categoryTabSelected]} onPress={() => setCategory(option)}>
                <Text style={[styles.categoryText, option === category && styles.categoryTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>}
        </View>
        {searchOpen ? renderForms(filterSafetyForms(forms, "All", searchText, statusFilters, sort)) : (
          <CategoryPager categories={categories} category={category} onCategoryChange={setCategory} onSwipeStateChange={setSwiping} minHeight={Math.max(240, height - 250)}>
            {(page) => renderForms(filterSafetyForms(forms, page, "", [], "newest"))}
          </CategoryPager>
        )}
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.createPosition, { bottom: insets.bottom + 86 }]}>
        <View pointerEvents="box-none" style={styles.createRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Create new safety checklist" style={styles.createButton} onPress={() => router.push("/checklists/new")}>
            <SymbolView name={{ ios: "doc.badge.plus", android: "note_add", web: "note_add" }} tintColor={theme.colors.white} size={28} fallback={<Text style={styles.createFallback}>▤+</Text>} />
          </Pressable>
        </View>
      </View>
      {!searchOpen && <FloatingTaskNav selected="Checklists" />}
      <Modal transparent visible={filterOpen && searchOpen} onRequestClose={() => setFilterOpen(false)} animationType="none" statusBarTranslucent>
        <View style={styles.filterOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close checklist sorting" style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} />
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
  formList: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, width: "100%" },
  formCard: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.mist, borderRadius: theme.radius.md, padding: 10, minHeight: 176, gap: 8, alignItems: "flex-start" },
  typeFallback: { color: theme.colors.navy, fontSize: 28 },
  formTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  formTitle: { flex: 1, minWidth: 0, color: theme.colors.navy, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  formType: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 15 },
  formBadge: { borderRadius: 12, paddingHorizontal: 8, minHeight: 22, alignItems: "center", justifyContent: "center", marginTop: "auto" },
  formBadgeText: { color: theme.colors.ink, fontSize: 11, fontWeight: "700" },
  createPosition: { position: "absolute", left: 20, right: 20, alignItems: "center", zIndex: 50 },
  createRow: { width: "100%", maxWidth: 400, alignItems: "flex-end" },
  createButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.navy, alignItems: "center", justifyContent: "center", boxShadow: "0px 3px 10px rgba(0,0,0,0.18)" },
  createFallback: { color: theme.colors.white, fontSize: 26 },
  logo: { width: 38 * (304 / 110), height: 38 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  headerFallback: { color: theme.colors.white, fontSize: 20 },
  page: { flexGrow: 1, width: "100%", maxWidth: 1180, alignSelf: "center", padding: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: 40, gap: theme.spacing.md },
  pageWide: { padding: 32, paddingTop: theme.spacing.lg, paddingBottom: 48 },
  searchSection: { gap: theme.spacing.sm },
  heading: { minHeight: 46, justifyContent: "center" },
  searchRow: { flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" },
  searchInput: { flex: 1, minWidth: 0, paddingRight: 48 },
  searchClose: { position: "absolute", right: 0, top: 0, width: 44, height: 46, alignItems: "center", justifyContent: "center" },
  searchCloseText: { color: theme.colors.navy, fontSize: 26, lineHeight: 30 },
  searchTools: { flexDirection: "row", gap: 6, alignItems: "center" },
  filterButton: { width: 36, height: 36, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  filterFallback: { color: theme.colors.navy, fontSize: 24 },
  categoryRow: { flexDirection: "row" },
  categoryTab: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: theme.colors.border },
  categoryTabSelected: { borderBottomColor: theme.colors.navy },
  categoryText: { fontSize: 14, fontWeight: "600", color: theme.colors.textMuted },
  categoryTextSelected: { color: theme.colors.navy },
  filterOverlay: { flex: 1 },
  filterPanel: { position: "absolute", width: 300, minHeight: 88, zIndex: 20, elevation: 8, padding: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.white },
});
