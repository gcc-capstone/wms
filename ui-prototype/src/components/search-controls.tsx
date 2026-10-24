import { Pressable, StyleSheet, Text, View } from "react-native";

import { ListSort } from "../constants/list-sort";
import { theme } from "../theme/orbital-theme";
import { statusColors } from "./task-status-badge";

const tagColors: Record<string, (typeof statusColors)["Completed"]> = {
  ...statusColors,
  Drafts: statusColors.Completed,
  Submitted: statusColors.Current,
};

export function SearchStatusTags<Status extends string>({ statuses, selected, onToggle }: { statuses: readonly Status[]; selected: readonly Status[]; onToggle: (status: Status) => void }) {
  return (
    <View style={styles.tags}>
      {statuses.map((status) => {
        const active = selected.includes(status);
        const colors = tagColors[status] ?? statusColors.Completed;
        return (
          <Pressable key={status} accessibilityRole="checkbox" accessibilityLabel={status} accessibilityState={{ checked: active }} style={[styles.tag, { backgroundColor: colors.backgroundColor, borderColor: active ? colors.accent : colors.backgroundColor }]} onPress={() => onToggle(status)}>
            <Text style={[styles.tagText, { color: colors.color }]}>{status}</Text>
            {active && <Text accessible={false} style={[styles.remove, { color: colors.color }]}>×</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const sortGroups = [
  { title: "Sort by date", options: [{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }] },
  { title: "Alphabetical", options: [{ value: "a-z", label: "A–Z" }, { value: "z-a", label: "Z–A" }] },
] as const;

export function SearchSortOptions({ selected, onSelect }: { selected: ListSort; onSelect: (sort: ListSort) => void }) {
  return (
    <View style={styles.sortMenu}>
      {sortGroups.map((group) => (
        <View key={group.title}>
          <Text accessibilityRole="header" style={styles.sortHeading}>{group.title}</Text>
          {group.options.map((option) => (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected === option.value }} onPress={() => onSelect(option.value)} style={styles.sortOption}>
              <Text style={styles.sortText}>{selected === option.value ? "◉" : "○"} {option.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tags: { flex: 1, minWidth: 0, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { minHeight: 34, paddingHorizontal: 8, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.white, flexDirection: "row", gap: 4, alignItems: "center" },
  tagText: { color: theme.colors.navy, fontSize: 12, fontWeight: "600" },
  remove: { color: theme.colors.white, fontSize: 16, lineHeight: 20 },
  sortMenu: { gap: 12 },
  sortHeading: { color: theme.colors.ink, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sortOption: { minHeight: 44, justifyContent: "center" },
  sortText: { color: theme.colors.navy, fontSize: 16 },
});
