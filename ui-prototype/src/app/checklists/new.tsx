import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSafetyForms } from "../../hooks/use-safety-forms";
import { useSmoothReturn } from "../../components/android-back-transition";
import { sharedStyles, theme } from "../../theme/orbital-theme";

const categoryRows = [
  [
    { label: "Industrial", icon: { ios: "wrench.and.screwdriver", android: "construction", web: "construction" }, fallback: "⚒" },
    { label: "Electrical", icon: { ios: "bolt", android: "bolt", web: "bolt" }, fallback: "ϟ" },
  ],
  [
    { label: "Site Hazards", icon: { ios: "exclamationmark.triangle", android: "warning", web: "warning" }, fallback: "⚠" },
    { label: "General", icon: { ios: "checklist", android: "fact_check", web: "fact_check" }, fallback: "☷" },
  ],
] as const;

export default function CreateSafetyChecklistScreen() {
  const { createForm } = useSafetyForms();
  const returnToChecklists = useSmoothReturn("/checklists");
  const insets = useSafeAreaInsets();

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 24 }]}>
        <Text accessibilityRole="header" style={styles.title}>Create New Safety Checklist</Text>
        <View style={styles.categories}>
          {categoryRows.map((row, index) => (
            <View key={index} style={styles.row}>
              {row.map((category) => (
                <Pressable key={category.label} accessibilityRole="button" accessibilityLabel={category.label} style={styles.categoryButton} onPress={() => { const id = createForm(category.label); router.push({ pathname: "/checklists/form/[id]", params: { id } }); }}>
                  <SymbolView name={category.icon} tintColor={theme.colors.navy} size={44} fallback={<Text style={styles.fallback}>{category.fallback}</Text>} />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel="Close new safety checklist" style={[styles.closeButton, { top: insets.top + 8, right: insets.right + 12 }]} onPress={returnToChecklists}>
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 20 },
  title: { width: "100%", color: theme.colors.navy, fontSize: 24, lineHeight: 32, fontWeight: "400", textAlign: "center" },
  closeButton: { position: "absolute", width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  closeText: { color: theme.colors.navy, fontSize: 32, lineHeight: 36 },
  categories: { marginTop: 32, gap: 16 },
  row: { flexDirection: "row", gap: 16 },
  categoryButton: { flex: 1, aspectRatio: 1, minHeight: 132, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.white, alignItems: "center", justifyContent: "center", gap: 16, padding: 12 },
  categoryLabel: { color: theme.colors.navy, fontSize: 18, fontWeight: "500", textAlign: "center" },
  fallback: { color: theme.colors.navy, fontSize: 44 },
});
