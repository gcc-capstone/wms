import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../theme/orbital-theme";

export function FloatingTaskNav({ selected }: { selected: "Tasks" | "Checklists" }) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom: insets.bottom + 16 }]}>
      <View accessibilityRole="tablist" style={styles.bar}>
        {(["Tasks", "Checklists"] as const).map((tab) => {
          const active = tab === selected;
          const color = theme.colors.navy;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityLabel={tab}
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => {
                if (active) return;
                if (tab === "Tasks") router.dismissTo("/tasks");
                else router.navigate("/checklists");
              }}
            >
              <SymbolView
                name={tab === "Tasks"
                  ? { ios: "doc.text", android: "assignment", web: "assignment" }
                  : { ios: "exclamationmark.triangle", android: "warning", web: "warning" }}
                tintColor={color}
                size={24}
                fallback={<Text style={[styles.fallback, { color }]}>{tab === "Tasks" ? "▤" : "⚠"}</Text>}
              />
              <Text style={[styles.label, { color }]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  position: { position: "absolute", left: 20, right: 20, alignItems: "center", zIndex: 50 },
  bar: { width: "100%", maxWidth: 400, flexDirection: "row", gap: 8, padding: 4, borderRadius: 48, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.navy, boxShadow: "0px 4px 16px rgba(0,0,0,0.18)" },
  tab: { flex: 1, minHeight: 48, borderRadius: 40, alignItems: "center", justifyContent: "center", gap: 0 },
  activeTab: { backgroundColor: "rgba(40,71,101,0.08)" },
  label: { fontSize: 12, lineHeight: 14, fontWeight: "700" },
  fallback: { fontSize: 24 },
});
